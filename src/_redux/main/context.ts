import { Context, createContext } from "react";

import { TMainContext } from "./types";

export const MainContext: Context<TMainContext> = createContext<TMainContext>({
  monacoEditorRef: { current: null },
  setMonacoEditorRef: () => {},
  iframeRefRef: { current: null },
  setIframeRefRef: () => {},

  importProject: () => {},
  reloadCurrentProject: () => {},
  triggerCurrentProjectReload: () => {},

  onUndo: () => {},
  onRedo: () => {},
});
