import { Shape } from "../sessionClient";

export default function ShapeRenderer({
  shape,
  isSelected = false,
  onSelect,
  socket,
}: {
  shape: Shape;
  isSelected?: boolean;
  onSelect?: (shape: Shape) => void;
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
  };

  const borderStyle = isSelected
    ? {
        border: "2px solid #667eea",
        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.2)",
      }
    : { border: `2px solid ${shape.stroke || "#1d4ed8"}` };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(shape);
  };

  switch (shape.type) {
    case "rectangle":
      return (
        <div
          className="shape rectangle"
          style={{
            ...baseStyle,
            backgroundColor: shape.fill || "#3b82f6",
            borderRadius: "4px",
            ...borderStyle,
          }}
          onClick={handleClick}
          title={`Rectangle by ${shape.userId}`}
        />
      );

    case "oval":
      return (
        <div
          className="shape oval"
          style={{
            ...baseStyle,
            backgroundColor: shape.fill || "#3b82f6",
            borderRadius: "50%",
            ...borderStyle,
          }}
          onClick={handleClick}
          title={`Oval by ${shape.userId}`}
        />
      );

    case "text":
      return (
        <div
          className="shape text"
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
          }}
          onClick={handleClick}
          title={`Text by ${shape.userId}`}
        >
          {shape.text || "Text"}
        </div>
      );

    default:
      return null;
  }
}
