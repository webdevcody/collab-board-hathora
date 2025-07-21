import React from "react";
import { Shape } from "../sessionClient";

export type ResizeHandle =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface SelectionHandlesProps {
  shape: Shape;
  onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
  cameraZoom: number;
}

export default function SelectionHandles({
  shape,
  onResizeStart,
  cameraZoom,
}: SelectionHandlesProps) {
  const handleSize = Math.max(8, 12 / cameraZoom); // Scale handle size with zoom
  const borderWidth = Math.max(1, 2 / cameraZoom); // Scale border with zoom

  const boundingBoxStyle = {
    position: "absolute" as const,
    left: shape.x - borderWidth,
    top: shape.y - borderWidth,
    width: shape.width + borderWidth * 2,
    height: shape.height + borderWidth * 2,
    border: `${borderWidth}px solid #667eea`,
    borderRadius: shape.type === "oval" ? "50%" : "4px",
    pointerEvents: "none" as const,
    boxSizing: "border-box" as const,
    zIndex: 1002,
  };

  const handleStyle = {
    position: "absolute" as const,
    width: handleSize,
    height: handleSize,
    backgroundColor: "#667eea",
    border: `${Math.max(1, 1 / cameraZoom)}px solid white`,
    borderRadius: "50%",
    cursor: "pointer",
    pointerEvents: "all" as const,
    zIndex: 1003,
    boxSizing: "border-box" as const,
  };

  const getHandlePosition = (handle: ResizeHandle) => {
    const halfHandle = handleSize / 2;
    const borderOffset = borderWidth;

    switch (handle) {
      case "top-left":
        return {
          left: shape.x - borderOffset - halfHandle,
          top: shape.y - borderOffset - halfHandle,
          cursor: "nw-resize",
        };
      case "top-right":
        return {
          left: shape.x + shape.width + borderOffset - halfHandle,
          top: shape.y - borderOffset - halfHandle,
          cursor: "ne-resize",
        };
      case "bottom-left":
        return {
          left: shape.x - borderOffset - halfHandle,
          top: shape.y + shape.height + borderOffset - halfHandle,
          cursor: "sw-resize",
        };
      case "bottom-right":
        return {
          left: shape.x + shape.width + borderOffset - halfHandle,
          top: shape.y + shape.height + borderOffset - halfHandle,
          cursor: "se-resize",
        };
    }
  };

  const handles: ResizeHandle[] = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  return (
    <>
      {/* Bounding box */}
      <div style={boundingBoxStyle} />

      {/* Corner handles */}
      {handles.map((handle) => {
        const position = getHandlePosition(handle);
        return (
          <div
            key={handle}
            style={{
              ...handleStyle,
              ...position,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart(handle, e);
            }}
            title={`Resize ${handle}`}
          />
        );
      })}
    </>
  );
}
