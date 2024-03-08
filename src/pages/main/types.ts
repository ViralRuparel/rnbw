import { ReactNode } from "react";

export type MainPageProps = {};

export type ResizablePanelsProps = {
  actionPanel: ReactNode;
  stageView: ReactNode;
  codeView: ReactNode;
};

export type AnyFunction = (...args: any[]) => any;