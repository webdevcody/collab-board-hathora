import React, { useRef, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  activeToolAtom,
  selectedShapeAtom,
  cameraOffsetAtom,
  cameraZoomAtom,
  isDarkModeAtom,
} from "../atoms/boardAtoms";
import { previewShapeAtom, setTextEditingAtom } from "../atoms/canvasAtoms";
import {
  isPanningAtom,
  isSpacePressedAtom,
  isResizingAtom,
  resizeHandleAtom,
  isRotatingAtom,
  isLinePointDraggingAtom,
  isDraggingAtom,
} from "../atoms/interactionAtoms";
import { useMouseEvents, useKeyboardEvents, useCameraControls } from "./hooks";
import { PreviewShape, Cursor, TextInput } from "./components";
import ShapeRenderer from "../../ShapeRenderer";
import SelectionHandles from "../../SelectionHandles";
import { CursorPosition, SessionClient, Shape } from "../../../sessionClient";

interface CanvasProps {
  userId: string;
  cursors: CursorPosition[];
  shapes: Shape[];
  client: SessionClient;
}

export default function Canvas({ userId, cursors, shapes, client }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Atoms
  const activeTool = useAtomValue(activeToolAtom);
  const setActiveTool = useSetAtom(activeToolAtom);
  const selectedShape = useAtomValue(selectedShapeAtom);
  const cameraOffset = useAtomValue(cameraOffsetAtom);
  const cameraZoom = useAtomValue(cameraZoomAtom);
  const isDarkMode = useAtomValue(isDarkModeAtom);
  const previewShape = useAtomValue(previewShapeAtom);
  const setTextEditing = useSetAtom(setTextEditingAtom);

  // Interaction state atoms
  const isPanning = useAtomValue(isPanningAtom);
  const isSpacePressed = useAtomValue(isSpacePressedAtom);
  const isResizing = useAtomValue(isResizingAtom);
  const resizeHandle = useAtomValue(resizeHandleAtom);
  const isRotating = useAtomValue(isRotatingAtom);
  const isLinePointDragging = useAtomValue(isLinePointDraggingAtom);
  const isDragging = useAtomValue(isDraggingAtom);

  const handleShapeCreated = () => {
    setActiveTool("select");
  };

  const handleTextEdit = (shape: Shape) => {
    setTextEditing(shape);
  };

  // Custom hooks
  const {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleShapeSelect,
    handleResizeStart,
    handleRotateStart,
    handleLinePointStart,
  } = useMouseEvents(canvasRef, client, handleShapeCreated);

  const { handleWheel, getCursorStyle } = useCameraControls(canvasRef);

  useKeyboardEvents(client);

  return (
    <div
      ref={canvasRef}
      className={`canvas ${isDarkMode ? "dark-mode" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        outline: "none",
        cursor: getCursorStyle(
          isPanning,
          isSpacePressed,
          isResizing,
          resizeHandle,
          isRotating,
          isLinePointDragging,
          isDragging,
          activeTool,
          selectedShape,
        ),
        backgroundPosition: `${cameraOffset.x}px ${cameraOffset.y}px`,
        backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
        backgroundImage: isDarkMode
          ? "radial-gradient(circle, #374151 1px, transparent 1px)"
          : "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
      }}
    >
      {/* Camera viewport container */}
      <div
        className="canvas-content"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px) scale(${cameraZoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Render shapes */}
        {shapes?.map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            isSelected={selectedShape?.id === shape.id}
            onSelect={handleShapeSelect}
            onTextEdit={handleTextEdit}
            client={client}
          />
        ))}

        {/* Render selection handles for selected shape */}
        {selectedShape && (
          <SelectionHandles
            shape={selectedShape}
            onResizeStart={handleResizeStart}
            onRotateStart={handleRotateStart}
            onLinePointStart={handleLinePointStart}
            cameraZoom={cameraZoom}
          />
        )}

        {/* Render preview shape while drawing */}
        {previewShape && <PreviewShape shape={previewShape} />}

        {/* Render active text input */}
        <TextInput client={client} onShapeCreated={handleShapeCreated} />

        {/* Render other users' cursors */}
        {cursors &&
          cursors
            .filter((cursor) => cursor.userId !== userId)
            .map((cursor) => <Cursor key={cursor.userId} position={cursor} userName={cursor.userId} />)}
      </div>
    </div>
  );
}
