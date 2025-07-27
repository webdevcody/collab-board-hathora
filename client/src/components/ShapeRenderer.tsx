import { SessionClient, Shape } from "../sessionClient";
import { useAtomValue } from "jotai";
import { editingTextShapeAtom } from "./Board/atoms/canvasAtoms";

export default function ShapeRenderer({
  shape,
  isSelected = false,
  onSelect,
  onTextEdit,
  client
}: {
  shape: Shape;
  isSelected?: boolean;
  onSelect?: (shape: Shape, e?: React.MouseEvent) => void;
  onTextEdit?: (shape: Shape) => void;
  client: SessionClient;
}) {
  const editingTextShape = useAtomValue(editingTextShapeAtom);

  // Hide the shape if it's currently being edited
  const isBeingEdited = editingTextShape?.id === shape.id;

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
    opacity: isBeingEdited ? 0 : 1 // Hide when being edited
  };

  const borderStyle = { border: `2px solid ${shape.stroke || "#1d4ed8"}` };

  // Remove default selection styling since we now use SelectionHandles component
  const selectionStyle = {};

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(shape, e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shape.type === "text" && onTextEdit) {
      onTextEdit(shape);
    }
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
            ...selectionStyle
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
            ...selectionStyle
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
            ...selectionStyle
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          title={`Text by ${shape.userId} - Double-click to edit`}
        >
          {shape.text || "Text"}
        </div>
      );

    case "line":
      return (
        <svg
          className={`shape line ${isSelected ? "selected" : ""}`}
          style={{
            position: "absolute" as const,
            left: Math.min(shape.x, shape.x + shape.width),
            top: Math.min(shape.y, shape.y + shape.height),
            width: Math.abs(shape.width),
            height: Math.abs(shape.height),
            cursor: "pointer",
            userSelect: "none" as const,
            pointerEvents: "none", // Disable pointer events on container
            transform: shape.rotation
              ? `rotate(${shape.rotation}deg)`
              : undefined,
            transformOrigin: "center center",
            overflow: "visible"
          }}
        >
          <title>{`Line by ${shape.userId}`}</title>
          {/* Invisible hit area for easier selection */}
          <line
            x1={shape.width >= 0 ? 0 : Math.abs(shape.width)}
            y1={shape.height >= 0 ? 0 : Math.abs(shape.height)}
            x2={shape.width >= 0 ? Math.abs(shape.width) : 0}
            y2={shape.height >= 0 ? Math.abs(shape.height) : 0}
            stroke="transparent"
            strokeWidth="20"
            strokeLinecap="round"
            style={{ pointerEvents: "all" }} // Enable pointer events on hit area
            onMouseDown={handleMouseDown}
          />
          {/* Visible line */}
          <line
            x1={shape.width >= 0 ? 0 : Math.abs(shape.width)}
            y1={shape.height >= 0 ? 0 : Math.abs(shape.height)}
            x2={shape.width >= 0 ? Math.abs(shape.width) : 0}
            y2={shape.height >= 0 ? Math.abs(shape.height) : 0}
            stroke={shape.stroke || "#1d4ed8"}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ pointerEvents: "none" }} // Disable pointer events on visible line
          />
        </svg>
      );

    case "arrow":
      const arrowLength = Math.sqrt(
        shape.width * shape.width + shape.height * shape.height
      );
      const arrowHeadSize = Math.min(12, arrowLength * 0.2); // Proportional arrowhead size

      // Calculate arrow direction
      const angle = Math.atan2(shape.height, shape.width);
      const arrowX1 = shape.width >= 0 ? 0 : Math.abs(shape.width);
      const arrowY1 = shape.height >= 0 ? 0 : Math.abs(shape.height);
      const arrowX2 = shape.width >= 0 ? Math.abs(shape.width) : 0;
      const arrowY2 = shape.height >= 0 ? Math.abs(shape.height) : 0;

      // Calculate arrowhead points
      const arrowHead1X =
        arrowX2 - arrowHeadSize * Math.cos(angle - Math.PI / 6);
      const arrowHead1Y =
        arrowY2 - arrowHeadSize * Math.sin(angle - Math.PI / 6);
      const arrowHead2X =
        arrowX2 - arrowHeadSize * Math.cos(angle + Math.PI / 6);
      const arrowHead2Y =
        arrowY2 - arrowHeadSize * Math.sin(angle + Math.PI / 6);

      return (
        <svg
          className={`shape arrow ${isSelected ? "selected" : ""}`}
          style={{
            position: "absolute" as const,
            left: Math.min(shape.x, shape.x + shape.width),
            top: Math.min(shape.y, shape.y + shape.height),
            width: Math.abs(shape.width),
            height: Math.abs(shape.height),
            cursor: "pointer",
            userSelect: "none" as const,
            pointerEvents: "none", // Disable pointer events on container
            transform: shape.rotation
              ? `rotate(${shape.rotation}deg)`
              : undefined,
            transformOrigin: "center center",
            overflow: "visible"
          }}
        >
          <title>{`Arrow by ${shape.userId}`}</title>
          {/* Invisible hit area for easier selection */}
          <line
            x1={arrowX1}
            y1={arrowY1}
            x2={arrowX2}
            y2={arrowY2}
            stroke="transparent"
            strokeWidth="20"
            strokeLinecap="round"
            style={{ pointerEvents: "all" }} // Enable pointer events on hit area
            onMouseDown={handleMouseDown}
          />
          {/* Invisible hit area for arrowhead */}
          <polyline
            points={`${arrowHead1X},${arrowHead1Y} ${arrowX2},${arrowY2} ${arrowHead2X},${arrowHead2Y}`}
            stroke="transparent"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ pointerEvents: "all" }} // Enable pointer events on arrowhead hit area
            onMouseDown={handleMouseDown}
          />
          {/* Main arrow line */}
          <line
            x1={arrowX1}
            y1={arrowY1}
            x2={arrowX2}
            y2={arrowY2}
            stroke={shape.stroke || "#1d4ed8"}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ pointerEvents: "none" }} // Disable pointer events on visible line
          />
          {/* Arrowhead */}
          <polyline
            points={`${arrowHead1X},${arrowHead1Y} ${arrowX2},${arrowY2} ${arrowHead2X},${arrowHead2Y}`}
            stroke={shape.stroke || "#1d4ed8"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ pointerEvents: "none" }} // Disable pointer events on visible arrowhead
          />
        </svg>
      );

    default:
      return null;
  }
}
