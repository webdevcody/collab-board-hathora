import { Tool } from "./Toolbar";
import { Shape } from "../sessionClient";

interface ShapesToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedShape: Shape | null;
  onDeleteShape: () => void;
}

export default function ShapesToolbar({
  activeTool,
  onToolChange,
  selectedShape,
  onDeleteShape,
}: ShapesToolbarProps) {
  const tools = [
    {
      id: "select" as Tool,
      name: "Select",
      icon: "✋",
      description: "Select and move shapes",
    },
    {
      id: "rectangle" as Tool,
      name: "Rectangle",
      icon: "▭",
      description: "Draw rectangles",
    },
    {
      id: "oval" as Tool,
      name: "Oval",
      icon: "○",
      description: "Draw ovals",
    },
    {
      id: "text" as Tool,
      name: "Text",
      icon: "T",
      description: "Add text",
    },
    {
      id: "line" as Tool,
      name: "Line",
      icon: "⟍",
      description: "Draw lines",
    },
    {
      id: "arrow" as Tool,
      name: "Arrow",
      icon: "→",
      description: "Draw arrows",
    },
  ];

  return (
    <div className="floating-toolbar shapes-toolbar">
      <div className="tool-buttons-compact">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-button-compact ${
              activeTool === tool.id ? "active" : ""
            }`}
            onClick={() => onToolChange(tool.id)}
            title={tool.description}
          >
            <span className="tool-icon">{tool.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
