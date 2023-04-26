import React from 'react';

export type PortalRenderData = React.ReactNode;

export type PortalRenderParams = PortalRenderData;

export type PortalRenderRef = {
  render: (toRender: PortalRenderData) => void;
};
