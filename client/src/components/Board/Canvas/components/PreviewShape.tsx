import React from "react";
import { Tool } from "../../../../components/Toolbar";

interface PreviewShapeProps {
  shape: {
    x: number;
    y: number;
    width: number;
    height: number;
    type: Tool;
  };
}

export default function PreviewShape({ shape }: PreviewShapeProps) {
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

    case "line":
      return (
        <svg
          className="preview-shape"
          style={{
            ...baseStyle,
            overflow: "visible",
          }}
        >
          {/* Invisible hit area for easier interaction */}
          <line
            x1={0}
            y1={0}
            x2={shape.width}
            y2={shape.height}
            stroke="transparent"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <line
            x1={0}
            y1={0}
            x2={shape.width}
            y2={shape.height}
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8,4"
          />
        </svg>
      );

    case "arrow":
      const arrowLength = Math.sqrt(
        shape.width * shape.width + shape.height * shape.height
      );
      const arrowHeadSize = Math.min(12, arrowLength * 0.2);

      // Calculate arrow direction
      const angle = Math.atan2(shape.height, shape.width);

      // Calculate arrowhead points
      const arrowHead1X =
        shape.width - arrowHeadSize * Math.cos(angle - Math.PI / 6);
      const arrowHead1Y =
        shape.height - arrowHeadSize * Math.sin(angle - Math.PI / 6);
      const arrowHead2X =
        shape.width - arrowHeadSize * Math.cos(angle + Math.PI / 6);
      const arrowHead2Y =
        shape.height - arrowHeadSize * Math.sin(angle + Math.PI / 6);

      return (
        <svg
          className="preview-shape"
          style={{
            ...baseStyle,
            overflow: "visible",
          }}
        >
          {/* Invisible hit area for easier interaction */}
          <line
            x1={0}
            y1={0}
            x2={shape.width}
            y2={shape.height}
            stroke="transparent"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <polyline
            points={`${arrowHead1X},${arrowHead1Y} ${shape.width},${shape.height} ${arrowHead2X},${arrowHead2Y}`}
            stroke="transparent"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Main arrow line */}
          <line
            x1={0}
            y1={0}
            x2={shape.width}
            y2={shape.height}
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8,4"
          />
          {/* Arrowhead */}
          <polyline
            points={`${arrowHead1X},${arrowHead1Y} ${shape.width},${shape.height} ${arrowHead2X},${arrowHead2Y}`}
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8,4"
            fill="none"
          />
        </svg>
      );

    default:
      return null;
  }
}
