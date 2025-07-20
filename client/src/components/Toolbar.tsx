import { ShapeType } from "../sessionClient";

export type Tool = "select" | ShapeType;

export default function Toolbar({
  activeTool,
  onToolChange,
  selectedShape,
  onDeleteShape,
}: {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedShape?: any;
  onDeleteShape?: () => void;
}) {
  const tools = [
    {
      id: "select" as Tool,
      name: "Select",
      icon: "↖",
      description: "Select and move shapes",
    },
    {
      id: "rectangle" as Tool,
      name: "Rectangle",
      icon: "▭",
      description: "Draw rectangles",
    },
    { id: "oval" as Tool, name: "Oval", icon: "○", description: "Draw ovals" },
    { id: "text" as Tool, name: "Text", icon: "T", description: "Add text" },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-content">
        <div className="toolbar-section">
          <h3 className="toolbar-title">Tools</h3>
          <div className="tool-grid">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className={`tool-button ${
                  activeTool === tool.id ? "active" : ""
                }`}
                onClick={() => onToolChange(tool.id)}
                title={tool.description}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-name">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedShape && (
          <div className="toolbar-section">
            <h3 className="toolbar-title">Actions</h3>
            <button
              className="delete-button"
              onClick={onDeleteShape}
              title="Delete selected shape (Delete key)"
            >
              <span className="tool-icon">🗑️</span>
              <span className="tool-name">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
