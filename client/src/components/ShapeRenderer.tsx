import { Shape } from "../sessionClient";

export default function ShapeRenderer({
  shape,
  isSelected = false,
  onSelect,
  socket,
}: {
  shape: Shape;
  isSelected?: boolean;
  onSelect?: (shape: Shape, e?: React.MouseEvent) => void;
  socket?: WebSocket;
}) {
  const baseStyle = {
    position: "absolute" as const,
    left: shape.x,
    top: shape.y,
    width: shape.width,
    height: shape.height,
    cursor: "pointer",
    userSelect: "none" as const,
    pointerEvents: "all" as const,
    transform: shape.rotation ? `rotate(${shape.rotation}deg)` : undefined,
    transformOrigin: "center center",
  };

  const borderStyle = { border: `2px solid ${shape.stroke || "#1d4ed8"}` };

  // Remove default selection styling since we now use SelectionHandles component
  const selectionStyle = {};

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(shape, e);
  };

  switch (shape.type) {
    case "rectangle":
      return (
        <div
          className={`shape rectangle ${isSelected ? "selected" : ""}`}
          style={{
            ...baseStyle,
            backgroundColor: shape.fill || "#3b82f6",
            borderRadius: "4px",
            ...borderStyle,
            ...selectionStyle,
          }}
          onMouseDown={handleMouseDown}
          title={`Rectangle by ${shape.userId}`}
        />
      );

    case "oval":
      return (
        <div
          className={`shape oval ${isSelected ? "selected" : ""}`}
          style={{
            ...baseStyle,
            backgroundColor: shape.fill || "#3b82f6",
            borderRadius: "50%",
            ...borderStyle,
            ...selectionStyle,
          }}
          onMouseDown={handleMouseDown}
          title={`Oval by ${shape.userId}`}
        />
      );

    case "text":
      return (
        <div
          className={`shape text ${isSelected ? "selected" : ""}`}
          style={{
            ...baseStyle,
            backgroundColor: "transparent",
            border: isSelected
              ? "2px dashed #667eea"
              : "2px dashed transparent",
            color: shape.fill || "#1f2937",
            fontSize: Math.min(shape.height / 2, 24),
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            minWidth: "100px",
            minHeight: "40px",
            cursor: "pointer",
            ...selectionStyle,
          }}
          onMouseDown={handleMouseDown}
          title={`Text by ${shape.userId}`}
        >
          {shape.text || "Text"}
        </div>
      );

    default:
      return null;
  }
}
