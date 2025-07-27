import { Shape } from "../../../common/messages";
import { Tool } from "./Toolbar";
import {
  MousePointer,
  Square,
  Circle,
  Type,
  Minus,
  ArrowRight
} from "lucide-react";

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
  isDarkMode
}: ShapesToolbarProps) {
  const tools = [
    {
      id: "select" as Tool,
      name: "Select",
      icon: MousePointer,
      hotkey: "C",
      description: "Select and move shapes (C)"
    },
    {
      id: "rectangle" as Tool,
      name: "Rectangle",
      icon: Square,
      hotkey: "R",
      description: "Draw rectangles (R)"
    },
    {
      id: "oval" as Tool,
      name: "Oval",
      icon: Circle,
      hotkey: "O",
      description: "Draw ovals (O)"
    },
    {
      id: "text" as Tool,
      name: "Text",
      icon: Type,
      hotkey: "T",
      description: "Add text (T)"
    },
    {
      id: "line" as Tool,
      name: "Line",
      icon: Minus,
      hotkey: "L",
      description: "Draw lines (L)"
    },
    {
      id: "arrow" as Tool,
      name: "Arrow",
      icon: ArrowRight,
      hotkey: "A",
      description: "Draw arrows (A)"
    }
  ];

  return (
    <div
      className={`floating-toolbar shapes-toolbar ${
        isDarkMode ? "dark-mode" : ""
      }`}
    >
      <div className="tool-buttons-compact">
        {tools.map(tool => {
          const IconComponent = tool.icon;
          return (
            <button
              key={tool.id}
              className={`tool-button-compact ${
                activeTool === tool.id ? "active" : ""
              }`}
              onClick={() => onToolChange(tool.id)}
              title={tool.description}
            >
              <IconComponent size={18} />
              <span className="tool-hotkey">{tool.hotkey}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
