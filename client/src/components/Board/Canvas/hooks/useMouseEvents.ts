import React from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeToolAtom,
  selectedShapeAtom,
  cameraOffsetAtom,
  cameraZoomAtom,
  isDarkModeAtom,
  selectedFillColorAtom,
} from "../../atoms/boardAtoms";
import {
  isDrawingAtom,
  drawStartAtom,
  previewShapeAtom,
  activeTextInputAtom,
  setTextInputAtom,
  clearTextInputAtom,
  triggerTextSubmitAtom,
} from "../../atoms/canvasAtoms";
import {
  isDraggingAtom,
  dragStartAtom,
  dragOffsetAtom,
  lastDragUpdateAtom,
  isPanningAtom,
  panStartAtom,
  isSpacePressedAtom,
  isResizingAtom,
  resizeHandleAtom,
  resizeStartAtom,
  isRotatingAtom,
  rotationStartAtom,
  isLinePointDraggingAtom,
  linePointHandleAtom,
  linePointStartAtom,
  resetDragStateAtom,
  resetPanStateAtom,
  resetResizeStateAtom,
  resetRotationStateAtom,
  resetLinePointStateAtom,
} from "../../atoms/interactionAtoms";
import { Shape, SessionClient } from "../../../../sessionClient";
import { ResizeHandle, LinePointHandle } from "../../../../components/SelectionHandles";

export const useMouseEvents = (
  canvasRef: React.RefObject<HTMLDivElement | null>,
  client: SessionClient,
  onShapeCreated?: () => void,
) => {
  const activeTool = useAtomValue(activeToolAtom);
  const [selectedShape, setSelectedShape] = useAtom(selectedShapeAtom);
  const [cameraOffset, setCameraOffset] = useAtom(cameraOffsetAtom);
  const cameraZoom = useAtomValue(cameraZoomAtom);
  const selectedFillColor = useAtomValue(selectedFillColorAtom);

  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [drawStart, setDrawStart] = useAtom(drawStartAtom);
  const [previewShape, setPreviewShape] = useAtom(previewShapeAtom);
  const [activeTextInput, setActiveTextInput] = useAtom(activeTextInputAtom);
  const setTextInput = useSetAtom(setTextInputAtom);
  const clearTextInput = useSetAtom(clearTextInputAtom);
  const triggerTextSubmit = useSetAtom(triggerTextSubmitAtom);

  const [isDragging, setIsDragging] = useAtom(isDraggingAtom);
  const [dragStart, setDragStart] = useAtom(dragStartAtom);
  const [dragOffset, setDragOffset] = useAtom(dragOffsetAtom);
  const [lastDragUpdate, setLastDragUpdate] = useAtom(lastDragUpdateAtom);
  const [isPanning, setIsPanning] = useAtom(isPanningAtom);
  const [panStart, setPanStart] = useAtom(panStartAtom);
  const isSpacePressed = useAtomValue(isSpacePressedAtom);
  const [isResizing, setIsResizing] = useAtom(isResizingAtom);
  const [resizeHandle, setResizeHandle] = useAtom(resizeHandleAtom);
  const [resizeStart, setResizeStart] = useAtom(resizeStartAtom);
  const [isRotating, setIsRotating] = useAtom(isRotatingAtom);
  const [rotationStart, setRotationStart] = useAtom(rotationStartAtom);
  const [isLinePointDragging, setIsLinePointDragging] = useAtom(isLinePointDraggingAtom);
  const [linePointHandle, setLinePointHandle] = useAtom(linePointHandleAtom);
  const [linePointStart, setLinePointStart] = useAtom(linePointStartAtom);

  const resetDragState = useSetAtom(resetDragStateAtom);
  const resetPanState = useSetAtom(resetPanStateAtom);
  const resetResizeState = useSetAtom(resetResizeStateAtom);
  const resetRotationState = useSetAtom(resetRotationStateAtom);
  const resetLinePointState = useSetAtom(resetLinePointStateAtom);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      // Apply camera offset and zoom to get world coordinates
      const x = (rawX - cameraOffset.x) / cameraZoom;
      const y = (rawY - cameraOffset.y) / cameraZoom;

      client.sendCursorMove(x, y);

      // Handle canvas panning
      if (isPanning && panStart) {
        const deltaX = rawX - panStart.x;
        const deltaY = rawY - panStart.y;
        setCameraOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        setPanStart({ x: rawX, y: rawY });
        return;
      }

      // Check if we should start dragging (only if mouse moved enough distance)
      if (!isDragging && dragStart && selectedShape && activeTool === "select") {
        const distance = Math.sqrt(Math.pow(rawX - dragStart.x, 2) + Math.pow(rawY - dragStart.y, 2));
        if (distance > 5) {
          // 5px threshold to avoid accidental drags
          setIsDragging(true);
        }
      }

      // Handle resizing selected shape
      if (isResizing && selectedShape && resizeStart && resizeHandle) {
        const currentX = (rawX - cameraOffset.x) / cameraZoom;
        const currentY = (rawY - cameraOffset.y) / cameraZoom;

        const deltaX = currentX - resizeStart.x;
        const deltaY = currentY - resizeStart.y;

        let newX = resizeStart.originalShape.x;
        let newY = resizeStart.originalShape.y;
        let newWidth = resizeStart.originalShape.width;
        let newHeight = resizeStart.originalShape.height;

        // Apply resize based on handle
        switch (resizeHandle) {
          case "top-left":
            newX = resizeStart.originalShape.x + deltaX;
            newY = resizeStart.originalShape.y + deltaY;
            newWidth = resizeStart.originalShape.width - deltaX;
            newHeight = resizeStart.originalShape.height - deltaY;
            break;
          case "top-right":
            newY = resizeStart.originalShape.y + deltaY;
            newWidth = resizeStart.originalShape.width + deltaX;
            newHeight = resizeStart.originalShape.height - deltaY;
            break;
          case "bottom-left":
            newX = resizeStart.originalShape.x + deltaX;
            newWidth = resizeStart.originalShape.width - deltaX;
            newHeight = resizeStart.originalShape.height + deltaY;
            break;
          case "bottom-right":
            newWidth = resizeStart.originalShape.width + deltaX;
            newHeight = resizeStart.originalShape.height + deltaY;
            break;
        }

        // Ensure minimum size
        const minSize = 20;
        if (newWidth < minSize) {
          if (resizeHandle === "top-left" || resizeHandle === "bottom-left") {
            newX = newX - (minSize - newWidth);
          }
          newWidth = minSize;
        }
        if (newHeight < minSize) {
          if (resizeHandle === "top-left" || resizeHandle === "top-right") {
            newY = newY - (minSize - newHeight);
          }
          newHeight = minSize;
        }

        // Throttle updates to avoid overwhelming the connection
        const now = Date.now();
        if (now - lastDragUpdate > 50) {
          client.sendShapeUpdate(selectedShape.id, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            fill: selectedShape.fill,
            stroke: selectedShape.stroke,
            text: selectedShape.text,
            rotation: selectedShape.rotation, // Preserve rotation during resize
          });
          setLastDragUpdate(now);
        }
      }
      // Handle rotating selected shape
      else if (isRotating && selectedShape && rotationStart) {
        const currentX = (rawX - cameraOffset.x) / cameraZoom;
        const currentY = (rawY - cameraOffset.y) / cameraZoom;

        // Calculate center of shape
        const centerX = selectedShape.x + selectedShape.width / 2;
        const centerY = selectedShape.y + selectedShape.height / 2;

        // Calculate angle from center to current mouse position
        const currentAngle = Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);

        // Calculate rotation difference
        const angleDelta = currentAngle - rotationStart.angle;
        let newRotation = rotationStart.originalRotation + angleDelta;

        // Normalize angle to 0-360 range
        newRotation = ((newRotation % 360) + 360) % 360;

        // Throttle updates to avoid overwhelming the connection
        const now = Date.now();
        if (now - lastDragUpdate > 50) {
          client.sendShapeUpdate(selectedShape.id, {
            x: selectedShape.x,
            y: selectedShape.y,
            width: selectedShape.width,
            height: selectedShape.height,
            fill: selectedShape.fill,
            stroke: selectedShape.stroke,
            text: selectedShape.text,
            rotation: newRotation,
          });
          setLastDragUpdate(now);
        }
      }
      // Handle line point dragging
      else if (isLinePointDragging && selectedShape && linePointStart && linePointHandle) {
        const currentX = (rawX - cameraOffset.x) / cameraZoom;
        const currentY = (rawY - cameraOffset.y) / cameraZoom;

        const deltaX = currentX - linePointStart.x;
        const deltaY = currentY - linePointStart.y;

        let newX = linePointStart.originalShape.x;
        let newY = linePointStart.originalShape.y;
        let newWidth = linePointStart.originalShape.width;
        let newHeight = linePointStart.originalShape.height;

        // Update line points based on which handle is being dragged
        if (linePointHandle === "start") {
          // Moving start point: adjust x, y and width, height accordingly
          newX = linePointStart.originalShape.x + deltaX;
          newY = linePointStart.originalShape.y + deltaY;
          newWidth = linePointStart.originalShape.width - deltaX;
          newHeight = linePointStart.originalShape.height - deltaY;
        } else if (linePointHandle === "end") {
          // Moving end point: only adjust width and height
          newWidth = linePointStart.originalShape.width + deltaX;
          newHeight = linePointStart.originalShape.height + deltaY;
        }

        // Throttle updates to avoid overwhelming the connection
        const now = Date.now();
        if (now - lastDragUpdate > 50) {
          client.sendShapeUpdate(selectedShape.id, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            fill: selectedShape.fill,
            stroke: selectedShape.stroke,
            text: selectedShape.text,
            rotation: selectedShape.rotation,
          });
          setLastDragUpdate(now);
        }
      }
      // Handle dragging selected shape
      else if (isDragging && selectedShape && dragOffset) {
        const newX = (rawX - dragOffset.x - cameraOffset.x) / cameraZoom;
        const newY = (rawY - dragOffset.y - cameraOffset.y) / cameraZoom;

        // Throttle updates to avoid overwhelming the connection
        const now = Date.now();
        if (now - lastDragUpdate > 50) {
          // Only update every 50ms - send complete shape data to prevent property loss
          client.sendShapeUpdate(selectedShape.id, {
            x: newX,
            y: newY,
            width: selectedShape.width,
            height: selectedShape.height,
            fill: selectedShape.fill,
            stroke: selectedShape.stroke,
            text: selectedShape.text,
            rotation: selectedShape.rotation, // Preserve rotation during drag
          });
          setLastDragUpdate(now);
        }
      }
      // Update preview shape while drawing (but not for text tool)
      else if (isDrawing && drawStart && activeTool !== "select" && activeTool !== "text") {
        let previewX, previewY, previewWidth, previewHeight;

        if (activeTool === "line" || activeTool === "arrow") {
          // For lines and arrows, preserve direction
          previewX = drawStart.x;
          previewY = drawStart.y;
          previewWidth = x - drawStart.x;
          previewHeight = y - drawStart.y;
        } else {
          // For rectangles/ovals, use absolute dimensions
          previewWidth = Math.abs(x - drawStart.x);
          previewHeight = Math.abs(y - drawStart.y);
          previewX = Math.min(drawStart.x, x);
          previewY = Math.min(drawStart.y, y);
        }

        setPreviewShape({
          x: previewX,
          y: previewY,
          width: previewWidth,
          height: previewHeight,
          type: activeTool,
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    // If there's an active text input and user clicks outside, save it first
    if (activeTextInput) {
      const target = e.target as HTMLElement;
      if (!target.closest("textarea")) {
        // Trigger text submission first, then clear
        triggerTextSubmit();
        return;
      }
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const x = (rawX - cameraOffset.x) / cameraZoom;
      const y = (rawY - cameraOffset.y) / cameraZoom;

      // Check if clicking on canvas background (not on a shape)
      const target = e.target as HTMLElement;
      const isCanvasBackground = target.classList.contains("canvas") || target.classList.contains("canvas-content");

      // Space+drag panning (works with any tool)
      if (isSpacePressed) {
        setIsPanning(true);
        setPanStart({ x: rawX, y: rawY });
        return;
      }

      if (activeTool === "select" && isCanvasBackground) {
        // Start canvas panning when clicking on empty space with select tool
        setIsPanning(true);
        setPanStart({ x: rawX, y: rawY });
        setSelectedShape(null); // Clear selection
        return;
      }

      if (activeTool === "text") {
        // For text tool, create immediate text input
        setTextInput({
          x: x,
          y: y,
          width: 200,
          height: 40,
        });
        return;
      }

      // For other tools, start drawing a new shape
      setDrawStart({ x, y });
      setIsDrawing(true);
      setPreviewShape(null); // Clear any existing preview
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Stop canvas panning
    if (isPanning) {
      resetPanState();
      return;
    }

    // Stop resizing
    if (isResizing) {
      resetResizeState();
      return;
    }

    // Stop rotating
    if (isRotating) {
      resetRotationState();
      return;
    }

    // Stop line point dragging
    if (isLinePointDragging) {
      resetLinePointState();
      return;
    }

    // Stop dragging or clear drag preparation
    if (isDragging || dragStart) {
      // Send final position update if we were dragging
      if (isDragging && selectedShape && dragOffset) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const rawX = e.clientX - rect.left;
          const rawY = e.clientY - rect.top;
          const newX = (rawX - dragOffset.x - cameraOffset.x) / cameraZoom;
          const newY = (rawY - dragOffset.y - cameraOffset.y) / cameraZoom;

          client.sendShapeUpdate(selectedShape.id, {
            x: newX,
            y: newY,
            width: selectedShape.width,
            height: selectedShape.height,
            fill: selectedShape.fill,
            stroke: selectedShape.stroke,
            text: selectedShape.text,
            rotation: selectedShape.rotation, // Preserve rotation during final drag update
          });
        }
      }

      resetDragState();
      return;
    }

    if (!isDrawing || !drawStart || activeTool === "select") {
      setIsDrawing(false);
      setDrawStart(null);
      setPreviewShape(null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const rawEndX = e.clientX - rect.left;
      const rawEndY = e.clientY - rect.top;
      const endX = (rawEndX - cameraOffset.x) / cameraZoom;
      const endY = (rawEndY - cameraOffset.y) / cameraZoom;

      const width = Math.abs(endX - drawStart.x);
      const height = Math.abs(endY - drawStart.y);

      // Only create shape if it has meaningful size (excluding text tool)
      const hasMinimumSize =
        activeTool === "line" || activeTool === "arrow"
          ? Math.sqrt(width * width + height * height) > 10 // For lines and arrows, check total distance
          : width > 10 && height > 10; // For rectangles/ovals, both dimensions must be > 10

      if (hasMinimumSize && activeTool !== "text") {
        let x, y, finalWidth, finalHeight;

        if (activeTool === "line" || activeTool === "arrow") {
          // For lines and arrows, preserve direction by using start point and relative end point
          x = drawStart.x;
          y = drawStart.y;
          finalWidth = endX - drawStart.x;
          finalHeight = endY - drawStart.y;
        } else {
          // For rectangles/ovals, use top-left corner and positive dimensions
          x = Math.min(drawStart.x, endX);
          y = Math.min(drawStart.y, endY);
          finalWidth = width;
          finalHeight = height;
        }

        // Create shape based on active tool with selected color
        client.sendShapeCreate(activeTool, x, y, finalWidth, finalHeight, {
          fill: selectedFillColor,
        });
        // Switch back to select tool after creating shape
        onShapeCreated?.();
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
    setPreviewShape(null);
  };

  const handleShapeSelect = (shape: Shape, e?: React.MouseEvent) => {
    if (activeTool === "select") {
      setSelectedShape(shape);

      // Prepare for potential dragging since this is now called on mousedown
      if (e) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const rawMouseX = e.clientX - rect.left;
          const rawMouseY = e.clientY - rect.top;

          setDragStart({ x: rawMouseX, y: rawMouseY });
          setDragOffset({
            x: rawMouseX - (shape.x * cameraZoom + cameraOffset.x),
            y: rawMouseY - (shape.y * cameraZoom + cameraOffset.y),
          });
        }
      }
    }
  };

  const handleResizeStart = (handle: ResizeHandle, e: React.MouseEvent) => {
    if (!selectedShape) return;

    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const x = (rawX - cameraOffset.x) / cameraZoom;
      const y = (rawY - cameraOffset.y) / cameraZoom;

      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStart({
        x,
        y,
        originalShape: { ...selectedShape },
      });
    }
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    if (!selectedShape) return;

    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const x = (rawX - cameraOffset.x) / cameraZoom;
      const y = (rawY - cameraOffset.y) / cameraZoom;

      // Calculate center of shape
      const centerX = selectedShape.x + selectedShape.width / 2;
      const centerY = selectedShape.y + selectedShape.height / 2;

      // Calculate initial angle from center to mouse position
      const initialAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);

      setIsRotating(true);
      setRotationStart({
        angle: initialAngle,
        originalRotation: selectedShape.rotation || 0,
      });
    }
  };

  const handleLinePointStart = (handle: LinePointHandle, e: React.MouseEvent) => {
    if (!selectedShape || (selectedShape.type !== "line" && selectedShape.type !== "arrow")) return;

    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const x = (rawX - cameraOffset.x) / cameraZoom;
      const y = (rawY - cameraOffset.y) / cameraZoom;

      setIsLinePointDragging(true);
      setLinePointHandle(handle);
      setLinePointStart({
        x,
        y,
        originalShape: { ...selectedShape },
      });
    }
  };

  return {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleShapeSelect,
    handleResizeStart,
    handleRotateStart,
    handleLinePointStart,
  };
};
