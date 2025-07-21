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
  onRotateStart: (e: React.MouseEvent) => void;
  cameraZoom: number;
}

export default function SelectionHandles({
  shape,
  onResizeStart,
  onRotateStart,
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

  // Rotation handle position - above the shape
  const rotationHandleDistance = Math.max(30, 40 / cameraZoom);
  const rotationHandleStyle = {
    position: "absolute" as const,
    width: handleSize,
    height: handleSize,
    backgroundColor: "#10b981", // Different color for rotation handle
    border: `${Math.max(1, 1 / cameraZoom)}px solid white`,
    borderRadius: "50%",
    cursor: "grab",
    pointerEvents: "all" as const,
    zIndex: 1003,
    boxSizing: "border-box" as const,
    left: shape.x + shape.width / 2 - handleSize / 2,
    top: shape.y - rotationHandleDistance - handleSize / 2,
  };

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

      {/* Rotation handle */}
      <div
        style={rotationHandleStyle}
        onMouseDown={(e) => {
          e.stopPropagation();
          onRotateStart(e);
        }}
        title="Rotate"
      />

      {/* Line connecting shape to rotation handle */}
      <div
        style={{
          position: "absolute" as const,
          left: shape.x + shape.width / 2 - 1 / cameraZoom,
          top: shape.y - rotationHandleDistance,
          width: Math.max(1, 2 / cameraZoom),
          height: rotationHandleDistance,
          backgroundColor: "#10b981",
          pointerEvents: "none" as const,
          zIndex: 1002,
        }}
      />
    </>
  );
}
