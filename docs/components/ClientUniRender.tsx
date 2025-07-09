"use client";

import { UniRender } from "@unilab/ukit";
import type { UniRenderProps } from "@unilab/ukit";
import { useEffect } from "react";
import { URPC } from "@unilab/urpc";

// Initialize URPC client
const initializeURPC = () => {
  URPC.init({
    enableDebug: true,
    plugins: [],
    middlewares: [],
    entityConfigs: {},
  });
};

export function ClientUniRender(props: UniRenderProps) {
  useEffect(() => {
    initializeURPC();
  }, []);

  return <UniRender {...props} />;
} 