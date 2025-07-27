import { ShapeType } from "../../../common/messages";

export type Tool = "select" | ShapeType;

export default function Toolbar({
  activeTool,
  onToolChange,
  selectedShape,
  onDeleteShape,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoomLevel
}: {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedShape?: any;
  onDeleteShape?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  zoomLevel?: number;
}) {
  const tools = [
    {
      id: "select" as Tool,
      name: "Select",
      icon: "↖",
      description: "Select and move shapes, click empty space to pan view"
    },
    {
      id: "rectangle" as Tool,
      name: "Rectangle",
      icon: "▭",
      description: "Draw rectangles"
    },
    { id: "oval" as Tool, name: "Oval", icon: "○", description: "Draw ovals" },
    { id: "text" as Tool, name: "Text", icon: "T", description: "Add text" },
    { id: "line" as Tool, name: "Line", icon: "⟍", description: "Draw lines" }
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-content">
        <div className="toolbar-section">
          <h3 className="toolbar-title">Tools</h3>
          <div className="tool-grid">
            {tools.map(tool => (
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

        <div className="toolbar-section">
          <h3 className="toolbar-title">Actions</h3>
          <button
            className={`delete-button ${!selectedShape ? "disabled" : ""}`}
            onClick={onDeleteShape}
            disabled={!selectedShape}
            title={
              selectedShape
                ? "Delete selected shape (Delete key)"
                : "Select a shape to delete"
            }
          >
            <span className="tool-icon">🗑️</span>
            <span className="tool-name">Delete</span>
          </button>
        </div>

        <div className="toolbar-section">
          <h3 className="toolbar-title">View</h3>
          <div className="zoom-controls">
            <button className="zoom-button" onClick={onZoomIn} title="Zoom In">
              <span className="tool-icon">🔍</span>
              <span className="zoom-text">+</span>
            </button>
            <button
              className="zoom-button"
              onClick={onZoomOut}
              title="Zoom Out"
            >
              <span className="tool-icon">🔍</span>
              <span className="zoom-text">−</span>
            </button>
            <button
              className="zoom-button reset"
              onClick={onZoomReset}
              title="Reset View (100%)"
            >
              <span className="zoom-text">
                {Math.round((zoomLevel || 1) * 100)}%
              </span>
            </button>
          </div>
        </div>

        <div className="toolbar-section">
          <h3 className="toolbar-title">Navigation</h3>
          <div className="help-text">
            <p>
              • <strong>Ctrl/Cmd + Scroll</strong> to zoom
            </p>
            <p>
              • Hold <strong>Space</strong> + drag to pan
            </p>
            <p>• Select tool: click empty space to pan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
