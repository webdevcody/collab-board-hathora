import React from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { cameraOffsetAtom, cameraZoomAtom } from "../../atoms/boardAtoms";

export const useCameraControls = (
  canvasRef: React.RefObject<HTMLDivElement | null>
) => {
  const [cameraOffset, setCameraOffset] = useAtom(cameraOffsetAtom);
  const [cameraZoom, setCameraZoom] = useAtom(cameraZoomAtom);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Zoom with Ctrl/Cmd + wheel
    if (e.ctrlKey || e.metaKey) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate zoom center point
        const worldX = (mouseX - cameraOffset.x) / cameraZoom;
        const worldY = (mouseY - cameraOffset.y) / cameraZoom;

        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(Math.max(cameraZoom * zoomDelta, 0.1), 5);

        // Adjust camera offset to zoom towards mouse position
        const newOffsetX = mouseX - worldX * newZoom;
        const newOffsetY = mouseY - worldY * newZoom;

        setCameraZoom(newZoom);
        setCameraOffset({ x: newOffsetX, y: newOffsetY });
      }
    }
  };

  const getCursorStyle = (
    isPanning: boolean,
    isSpacePressed: boolean,
    isResizing: boolean,
    resizeHandle: string | null,
    isRotating: boolean,
    isLinePointDragging: boolean,
    isDragging: boolean,
    activeTool: string,
    selectedShape: any
  ) => {
    if (isPanning) {
      return "grabbing";
    }
    if (isSpacePressed) {
      return "grab";
    }
    if (isResizing) {
      // Return cursor based on resize handle
      switch (resizeHandle) {
        case "top-left":
        case "bottom-right":
          return "nw-resize";
        case "top-right":
        case "bottom-left":
          return "ne-resize";
        default:
          return "grabbing";
      }
    }
    if (isRotating) {
      return "grabbing";
    }
    if (isLinePointDragging) {
      return "move";
    }
    if (isDragging) {
      return "grabbing";
    }
    switch (activeTool) {
      case "select":
        return selectedShape ? "grab" : "grab";
      case "text":
        return "text";
      default:
        return "crosshair";
    }
  };

  return {
    handleWheel,
    getCursorStyle,
  };
};
