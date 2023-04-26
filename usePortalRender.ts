import React from 'react';
import { PortalRenderData, PortalRenderParams } from './types';

export function usePortalRender() {
  const [data, setData] = React.useState<PortalRenderData>(null);

  const render = React.useCallback((toRender: PortalRenderParams) => {
    setData(toRender);
  }, []);

  return { data, render };
}
