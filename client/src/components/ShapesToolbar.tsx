import { Tool } from "./Toolbar";
import { Shape } from "../sessionClient";

interface ShapesToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedShape: Shape | null;
  onDeleteShape: () => void;
  isDarkMode: boolean;
}

export default function ShapesToolbar({
  activeTool,
  onToolChange,
  selectedShape,
  onDeleteShape,
  isDarkMode,
}: ShapesToolbarProps) {
  const tools = [
    {
      id: "select" as Tool,
      name: "Select",
      icon: "✋",
      hotkey: "C",
      description: "Select and move shapes (C)",
    },
    {
      id: "rectangle" as Tool,
      name: "Rectangle",
      icon: "▭",
      hotkey: "R",
      description: "Draw rectangles (R)",
    },
    {
      id: "oval" as Tool,
      name: "Oval",
      icon: "○",
      hotkey: "O",
      description: "Draw ovals (O)",
    },
    {
      id: "text" as Tool,
      name: "Text",
      icon: "T",
      hotkey: "T",
      description: "Add text (T)",
    },
    {
      id: "line" as Tool,
      name: "Line",
      icon: "⟍",
      hotkey: "L",
      description: "Draw lines (L)",
    },
    {
      id: "arrow" as Tool,
      name: "Arrow",
      icon: "→",
      hotkey: "A",
      description: "Draw arrows (A)",
    },
  ];

  return (
    <div
      className={`floating-toolbar shapes-toolbar ${
        isDarkMode ? "dark-mode" : ""
      }`}
    >
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
            <span className="tool-hotkey">{tool.hotkey}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
