import React, { useRef, useState, useEffect } from "react";
import {
  BoardSessionData,
  CursorPosition,
  sendCursorMove,
  sendShapeCreate,
  sendShapeUpdate,
  sendShapeDelete,
  Shape,
} from "../sessionClient";
import { Tool } from "./Toolbar";
import ShapeRenderer from "./ShapeRenderer";
import ShapesToolbar from "./ShapesToolbar";
import ZoomToolbar from "./ZoomToolbar";
import StyleToolbar from "./StyleToolbar";

export default function Board({
  userId,
  snapshot,
  connectionHost,
  socket,
}: {
  userId: string;
  connectionHost: string;
  snapshot: BoardSessionData;
  socket: WebSocket;
}) {
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [cameraZoom, setCameraZoom] = useState<number>(1);
  const [showToolbars, setShowToolbars] = useState<boolean>(true);

  // Update selectedShape when shapes array changes to ensure we have the latest data
  useEffect(() => {
    if (selectedShape && snapshot.shapes) {
      const updatedShape = snapshot.shapes.find(
        (shape) => shape.id === selectedShape.id
      );
      if (updatedShape) {
        setSelectedShape(updatedShape);
      } else {
        // Shape was deleted, clear selection
        setSelectedShape(null);
      }
    }
  }, [snapshot.shapes, selectedShape?.id]);

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  const handleZoomIn = () => {
    setCameraZoom((prev) => Math.min(prev * 1.2, 5)); // Max 5x zoom
  };

  const handleZoomOut = () => {
    setCameraZoom((prev) => Math.max(prev / 1.2, 0.1)); // Min 0.1x zoom
  };

  const handleZoomReset = () => {
    setCameraZoom(1);
    setCameraOffset({ x: 0, y: 0 });
  };

  const toggleToolbars = () => {
    setShowToolbars(!showToolbars);
  };

  return (
    <div className="board-container">
      {/* Full-screen canvas */}
      <Canvas
        userId={userId}
        cursors={snapshot.cursors}
        shapes={snapshot.shapes}
        socket={socket}
        activeTool={activeTool}
        selectedShape={selectedShape}
        onShapeSelect={setSelectedShape}
        onShapeCreated={() => setActiveTool("select")}
        cameraOffset={cameraOffset}
        setCameraOffset={setCameraOffset}
        cameraZoom={cameraZoom}
        setCameraZoom={setCameraZoom}
      />

      {/* Toolbar Toggle Button */}
      <button
        className="toolbar-toggle"
        onClick={toggleToolbars}
        title={showToolbars ? "Hide Toolbars" : "Show Toolbars"}
      >
        {showToolbars ? "🙈" : "👁️"}
      </button>

      {/* Floating Connected Users Indicator */}
      <ConnectedUsersIndicator
        connectedUsers={snapshot.connectedUsers}
        currentUserId={userId}
        connectionHost={connectionHost}
        visible={showToolbars}
      />

      {/* Floating Toolbars */}
      {showToolbars && (
        <>
          <ShapesToolbar
            activeTool={activeTool}
            onToolChange={handleToolChange}
            selectedShape={selectedShape}
            onDeleteShape={() => {
              if (selectedShape) {
                sendShapeDelete(socket, selectedShape.id);
                setSelectedShape(null);
              }
            }}
          />

          <ZoomToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            zoomLevel={cameraZoom}
          />

          <StyleToolbar selectedShape={selectedShape} socket={socket} />
        </>
      )}
    </div>
  );
}

function ConnectedUsersIndicator({
  connectedUsers,
  currentUserId,
  connectionHost,
  visible,
}: {
  connectedUsers: string[];
  currentUserId: string;
  connectionHost: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="connected-users-floating">
      <div className="users-section">
        <span className="users-label">
          Users ({connectedUsers?.length || 0})
        </span>
        <div className="users-list">
          {connectedUsers?.map((user) => (
            <span
              key={user}
              className={`user-pill ${user === currentUserId ? "own" : ""}`}
            >
              {user}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Canvas({
  userId,
  cursors,
  shapes,
  socket,
  activeTool,
  selectedShape,
  onShapeSelect,
  onShapeCreated,
  cameraOffset,
  setCameraOffset,
  cameraZoom,
  setCameraZoom,
}: {
  userId: string;
  cursors: CursorPosition[];
  shapes: Shape[];
  socket: WebSocket;
  activeTool: Tool;
  selectedShape: Shape | null;
  onShapeSelect: (shape: Shape | null) => void;
  onShapeCreated: () => void;
  cameraOffset: { x: number; y: number };
  setCameraOffset: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  cameraZoom: number;
  setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [previewShape, setPreviewShape] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: Tool;
  } | null>(null);
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lastDragUpdate, setLastDragUpdate] = useState<number>(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      // Apply camera offset and zoom to get world coordinates
      const x = (rawX - cameraOffset.x) / cameraZoom;
      const y = (rawY - cameraOffset.y) / cameraZoom;

      sendCursorMove(socket, x, y);

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
      if (
        !isDragging &&
        dragStart &&
        selectedShape &&
        activeTool === "select"
      ) {
        const distance = Math.sqrt(
          Math.pow(rawX - dragStart.x, 2) + Math.pow(rawY - dragStart.y, 2)
        );
        if (distance > 5) {
          // 5px threshold to avoid accidental drags
          setIsDragging(true);
        }
      }

      // Handle dragging selected shape
      if (isDragging && selectedShape && dragOffset) {
        const newX = (rawX - dragOffset.x - cameraOffset.x) / cameraZoom;
        const newY = (rawY - dragOffset.y - cameraOffset.y) / cameraZoom;

        // Throttle updates to avoid overwhelming the connection
        const now = Date.now();
        if (now - lastDragUpdate > 50) {
          // Only update every 50ms - send complete shape data to prevent property loss
          sendShapeUpdate(socket, selectedShape.id, {
            x: newX,
            y: newY,
            width: selectedShape.width,
            height: selectedShape.height,
            fill: selectedShape.fill,
            stroke: selectedShape.stroke,
            text: selectedShape.text,
          });
          setLastDragUpdate(now);
        }
      }
      // Update preview shape while drawing (but not for text tool)
      else if (
        isDrawing &&
        drawStart &&
        activeTool !== "select" &&
        activeTool !== "text"
      ) {
        const width = Math.abs(x - drawStart.x);
        const height = Math.abs(y - drawStart.y);
        const previewX = Math.min(drawStart.x, x);
        const previewY = Math.min(drawStart.y, y);

        setPreviewShape({
          x: previewX,
          y: previewY,
          width,
          height,
          type: activeTool,
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    // If there's an active text input and user clicks outside, save it
    if (activeTextInput) {
      const target = e.target as HTMLElement;
      if (!target.closest("textarea")) {
        handleTextSubmit();
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
      const isCanvasBackground =
        target.classList.contains("canvas") ||
        target.classList.contains("canvas-content");

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
        onShapeSelect(null); // Clear selection
        return;
      }

      if (activeTool === "text") {
        // For text tool, create immediate text input
        setActiveTextInput({
          x: x,
          y: y,
          width: 200,
          height: 40,
        });
        setTextInputValue("");
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
      setIsPanning(false);
      setPanStart(null);
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

          sendShapeUpdate(socket, selectedShape.id, {
            x: newX,
            y: newY,
            width: selectedShape.width,
            height: selectedShape.height,
            fill: selectedShape.fill,
            stroke: selectedShape.stroke,
            text: selectedShape.text,
          });
        }
      }

      setIsDragging(false);
      setDragStart(null);
      setDragOffset(null);
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
      if (width > 10 && height > 10 && activeTool !== "text") {
        const x = Math.min(drawStart.x, endX);
        const y = Math.min(drawStart.y, endY);

        // Create shape based on active tool
        sendShapeCreate(socket, activeTool, x, y, width, height);
        // Switch back to select tool after creating shape
        onShapeCreated();
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
    setPreviewShape(null);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Mouse entered canvas
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Mouse left canvas
  };

  const handleShapeSelect = (shape: Shape, e?: React.MouseEvent) => {
    if (activeTool === "select") {
      onShapeSelect(shape);

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

  const getCursorStyle = () => {
    if (isPanning) {
      return "grabbing";
    }
    if (isSpacePressed) {
      return "grab";
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

  const handleTextSubmit = () => {
    if (activeTextInput && textInputValue.trim()) {
      sendShapeCreate(
        socket,
        "text",
        activeTextInput.x,
        activeTextInput.y,
        activeTextInput.width,
        activeTextInput.height,
        {
          text: textInputValue.trim(),
          fill: "#1f2937",
        }
      );
      // Switch back to select tool after creating text shape
      onShapeCreated();
    }
    setActiveTextInput(null);
    setTextInputValue("");
  };

  const handleTextCancel = () => {
    setActiveTextInput(null);
    setTextInputValue("");
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleTextCancel();
    }
  };

  const handleZoomIn = () => {
    setCameraZoom((prev) => Math.min(prev * 1.2, 5)); // Max 5x zoom
  };

  const handleZoomOut = () => {
    setCameraZoom((prev) => Math.max(prev / 1.2, 0.1)); // Min 0.1x zoom
  };

  const handleZoomReset = () => {
    setCameraZoom(1);
    setCameraOffset({ x: 0, y: 0 });
  };

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

  const handleKeyDown = (e: KeyboardEvent) => {
    // Space key for panning mode
    if (e.key === " " && !activeTextInput && !isSpacePressed) {
      e.preventDefault();
      setIsSpacePressed(true);
      return;
    }

    // Delete selected shape with Delete or Backspace key
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      selectedShape &&
      !activeTextInput
    ) {
      e.preventDefault();
      sendShapeDelete(socket, selectedShape.id);
      onShapeSelect(null); // Clear selection
    }
    // Escape key to deselect
    else if (e.key === "Escape" && selectedShape && !activeTextInput) {
      onShapeSelect(null);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      setIsSpacePressed(false);
      // Stop panning if space is released
      if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
      }
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedShape, activeTextInput, isSpacePressed, isPanning]);

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{
        outline: "none",
        cursor: getCursorStyle(),
        backgroundPosition: `${cameraOffset.x}px ${cameraOffset.y}px`,
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
            socket={socket}
          />
        ))}

        {/* Render preview shape while drawing */}
        {previewShape && <PreviewShape shape={previewShape} />}

        {/* Render active text input */}
        {activeTextInput && (
          <div
            style={{
              position: "absolute",
              left: activeTextInput.x,
              top: activeTextInput.y,
              width: activeTextInput.width,
              height: activeTextInput.height,
              zIndex: 1001,
            }}
          >
            <textarea
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyDown={handleTextKeyDown}
              onBlur={handleTextSubmit}
              autoFocus
              style={{
                width: "100%",
                height: "100%",
                border: "2px solid #667eea",
                outline: "none",
                background: "white",
                color: "#1f2937",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: "inherit",
                resize: "none",
                padding: "8px",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
              placeholder="Type your text..."
            />
          </div>
        )}

        {/* Render other users' cursors */}
        {cursors &&
          cursors
            .filter((cursor) => cursor.userId !== userId)
            .map((cursor) => (
              <Cursor
                key={cursor.userId}
                position={cursor}
                userName={cursor.userId}
              />
            ))}
      </div>
    </div>
  );
}

function PreviewShape({
  shape,
}: {
  shape: { x: number; y: number; width: number; height: number; type: Tool };
}) {
  const baseStyle = {
    position: "absolute" as const,
    left: shape.x,
    top: shape.y,
    width: shape.width,
    height: shape.height,
    pointerEvents: "none" as const,
    border: "2px dashed #667eea",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    zIndex: 999,
  };

  switch (shape.type) {
    case "rectangle":
      return (
        <div
          className="preview-shape"
          style={{
            ...baseStyle,
            borderRadius: "4px",
          }}
        />
      );

    case "oval":
      return (
        <div
          className="preview-shape"
          style={{
            ...baseStyle,
            borderRadius: "50%",
          }}
        />
      );

    case "text":
      return (
        <div
          className="preview-shape"
          style={{
            ...baseStyle,
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#667eea",
            fontWeight: 500,
          }}
        >
          Click to add text
        </div>
      );

    default:
      return null;
  }
}

function Cursor({
  position,
  userName,
}: {
  position: CursorPosition;
  userName: string;
}) {
  return (
    <div
      className="remote-cursor"
      style={{
        left: position.x,
        top: position.y,
        position: "absolute",
        pointerEvents: "none",
        zIndex: 1000,
        transform: "translate(-2px, -2px)",
      }}
    >
      <div
        className="cursor-pointer"
        style={{
          fontSize: "20px",
          color: "#667eea",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        ↖
      </div>
      <div className="cursor-label">{userName}</div>
    </div>
  );
}
