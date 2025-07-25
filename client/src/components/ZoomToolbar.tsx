interface ZoomToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  zoomLevel: number;
  isDarkMode: boolean;
}

export default function ZoomToolbar({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoomLevel,
  isDarkMode,
}: ZoomToolbarProps) {
  return (
    <div
      className={`floating-toolbar zoom-toolbar ${
        isDarkMode ? "dark-mode" : ""
      }`}
    >
      <div className="zoom-controls-compact">
        <button
          className="zoom-button-compact"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <span className="tool-icon">+</span>
        </button>
        <button
          className="zoom-button-compact"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <span className="tool-icon">−</span>
        </button>
        <button
          className="zoom-button-compact reset"
          onClick={onZoomReset}
          title={`Reset View (${Math.round(zoomLevel * 100)}%)`}
        >
          <span className="zoom-text-compact">
            {Math.round(zoomLevel * 100)}%
          </span>
        </button>
      </div>
    </div>
  );
}
