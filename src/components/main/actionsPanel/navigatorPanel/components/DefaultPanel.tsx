import React, { useContext, useMemo } from "react";

import { SVGIconI } from "@_components/common";
import { RootNodeUid } from "@_constants/main";
import { MainContext } from "@_redux/main";

import { getFileExtension, getFileNameFromPath, isHomeIcon } from "../helpers";
import { useNavigatorPanelHandlers } from "../hooks";
import { useAppState } from "@_redux/useAppState";

export const DefaultPanel = () => {
  const { project, fileTree, currentFileUid } = useAppState();

  const { filesReferenceData } = useContext(MainContext);

  const fileNode = useMemo(
    () => fileTree[currentFileUid],
    [fileTree, currentFileUid],
  );
  const fileName = useMemo(
    () => fileNode && getFileNameFromPath(fileNode),
    [fileNode],
  );
  const fileExtension = useMemo(
    () => fileNode && getFileExtension(fileNode),
    [fileNode],
  );

  const { onProjectClick, onFileClick } = useNavigatorPanelHandlers();

  return (
    <>
      <div className="gap-s align-center" onClick={onProjectClick}>
        <SVGIconI {...{ class: "icon-xs" }}>folder</SVGIconI>
        <span
          className="text-s"
          style={{
            maxWidth: "60px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {project.name}
        </span>
      </div>
      <span className="text-s opacity-m">/</span>

      {fileNode && fileNode.parentUid !== RootNodeUid && (
        <>
          <span className="text-s">...</span>
          <span className="text-s opacity-m">/</span>
        </>
      )}

      {fileNode && (
        <div className="gap-s align-center" onClick={onFileClick}>
          <SVGIconI {...{ class: "icon-xs" }}>
            {isHomeIcon(fileNode)
              ? "home"
              : filesReferenceData[fileExtension] && fileExtension !== "md"
              ? filesReferenceData[fileExtension].Icon
              : "page"}
          </SVGIconI>
          <span
            className="text-s"
            style={{
              width: fileNode.parentUid !== RootNodeUid ? "60px" : "90px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {fileName}
          </span>

          {fileNode && fileNode.data.changed && (
            <div
              className="radius-s foreground-primary"
              title="unsaved file"
              style={{ width: "6px", height: "6px" }}
            />
          )}
        </div>
      )}
    </>
  );
};
