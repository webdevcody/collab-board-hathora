import { useRef, useState, useEffect } from "react";
import {
  BoardSessionData,
  CursorPosition,
  sendCursorMove,
  sendShapeCreate,
  sendShapeUpdate,
  sendShapeDelete,
  Shape,
} from "../sessionClient";
import Toolbar, { Tool } from "./Toolbar";
import ShapeRenderer from "./ShapeRenderer";

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

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  return (
    <div className="board-container">
      <BoardHeader
        connectedUsers={snapshot.connectedUsers}
        currentUserId={userId}
        connectionHost={connectionHost}
      />
      <div className="board-main">
        <Toolbar
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
        <Canvas
          userId={userId}
          cursors={snapshot.cursors}
          shapes={snapshot.shapes}
          socket={socket}
          activeTool={activeTool}
          selectedShape={selectedShape}
          onShapeSelect={setSelectedShape}
        />
      </div>
    </div>
  );
}

function BoardHeader({
  connectedUsers,
  currentUserId,
  connectionHost,
}: {
  connectedUsers: string[];
  currentUserId: string;
  connectionHost: string;
}) {
  return (
    <div className="connected-users">
      <div className="connection-host">Connected to: {connectionHost}</div>
      <div className="users-section">
        <span className="users-label">
          Users ({connectedUsers?.length || 0}):
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
}: {
  userId: string;
  cursors: CursorPosition[];
  shapes: Shape[];
  socket: WebSocket;
  activeTool: Tool;
  selectedShape: Shape | null;
  onShapeSelect: (shape: Shape | null) => void;
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

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sendCursorMove(socket, x, y);

      // Check if we should start dragging (only if mouse moved enough distance)
      if (
        !isDragging &&
        dragStart &&
        selectedShape &&
        activeTool === "select"
      ) {
        const distance = Math.sqrt(
          Math.pow(x - dragStart.x, 2) + Math.pow(y - dragStart.y, 2)
        );
        if (distance > 5) {
          // 5px threshold to avoid accidental drags
          setIsDragging(true);
        }
      }

      // Handle dragging selected shape
      if (isDragging && selectedShape && dragOffset) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (activeTool === "select") {
        // Clear selection when clicking on empty space (shapes handle their own selection)
        onShapeSelect(null);
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
    // Stop dragging or clear drag preparation
    if (isDragging || dragStart) {
      // Send final position update if we were dragging
      if (isDragging && selectedShape && dragOffset) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const newX = x - dragOffset.x;
          const newY = y - dragOffset.y;

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
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const width = Math.abs(endX - drawStart.x);
      const height = Math.abs(endY - drawStart.y);

      // Only create shape if it has meaningful size (excluding text tool)
      if (width > 10 && height > 10 && activeTool !== "text") {
        const x = Math.min(drawStart.x, endX);
        const y = Math.min(drawStart.y, endY);

        // Create shape based on active tool
        sendShapeCreate(socket, activeTool, x, y, width, height);
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
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          setDragStart({ x: mouseX, y: mouseY });
          setDragOffset({
            x: mouseX - shape.x,
            y: mouseY - shape.y,
          });
        }
      }
    }
  };

  const getCursorStyle = () => {
    if (isDragging) {
      return "grabbing";
    }
    switch (activeTool) {
      case "select":
        return selectedShape ? "grab" : "default";
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

  const handleKeyDown = (e: KeyboardEvent) => {
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

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedShape, activeTextInput]);

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        outline: "none",
        cursor: getCursorStyle(),
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
