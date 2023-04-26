// inspired on https://github.com/calintamas/react-native-toast-message

import React from 'react';

import { PortalRenderParams, PortalRenderRef } from './types';
import { usePortalRender } from './usePortalRender';

const PortalRenderRoot = React.forwardRef((_, ref) => {
  const { render, data } = usePortalRender();

  // This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
  React.useImperativeHandle(
    ref,
    React.useCallback(() => ({ render }), [render])
  );

  return <>{data}</>;
});

type PortalRenderRefObj = {
  current: PortalRenderRef | null;
};

let refs: PortalRenderRefObj[] = [];

/**
 * Adds a ref to the end of the array, which will be used to show the rortalRenders until its ref becomes null.
 *
 * @param newRef the new ref, which must be stable for the life of the PortalRender instance.
 */
function addNewRef(newRef: PortalRenderRef) {
  refs.push({ current: newRef });
}

/**
 * Removes the passed in ref from the file-level refs array using a strict equality check.
 *
 * @param oldRef the exact ref object to remove from the refs array.
 */
function removeOldRef(oldRef: PortalRenderRef | null) {
  refs = refs.filter((r) => r.current !== oldRef);
}

export function PortalRender() {
  const rortalRenderRef = React.useRef<PortalRenderRef | null>(null);

  /*
    This must use `useCallback` to ensure the ref doesn't get set to null and then a new ref every render.
    Failure to do so will cause whichever PortalRender *renders or re-renders* last to be the instance that is used,
    rather than being the PortalRender that was *mounted* last.
  */
  const setRef = React.useCallback((ref: PortalRenderRef | null) => {
    // Since we know there's a ref, we'll update `refs` to use it.
    if (ref) {
      // store the ref in this rortalRender instance to be able to remove it from the array later when the ref becomes null.
      rortalRenderRef.current = ref;
      addNewRef(ref);
    } else {
      // remove the this rortalRender's ref, wherever it is in the array.
      removeOldRef(rortalRenderRef.current);
    }
  }, []);

  return <PortalRenderRoot ref={setRef} />;
}

/**
 * Get the active PortalRender instance `ref`, by priority.
 * The "highest" PortalRender in the `View` hierarchy has the highest priority.
 *
 * For example, a PortalRender inside a `Modal`, would have had its ref set later than a PortalRender inside App's Root.
 * Therefore, the library knows that it is currently visible on top of the App's Root
 * and will thus use the `Modal`'s PortalRender when showing/hiding.
 *
 * ```js
 * <>
 *  <PortalRender />
 *  <Modal>
 *    <PortalRender />
 *  </Modal>
 * </>
 * ```
 */
function getRef() {
  const reversePriority = [...refs].reverse();
  const activeRef = reversePriority.find((ref) => ref?.current !== null);
  if (!activeRef) {
    return null;
  }
  return activeRef.current;
}

PortalRender.render = (params: PortalRenderParams) => {
  getRef()?.render(params);
};
