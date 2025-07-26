import { Shape, sendShapeUpdate } from "../sessionClient";

interface StyleToolbarProps {
  selectedShape: Shape | null;
  socket: WebSocket;
  isDarkMode: boolean;
}

export default function StyleToolbar({
  selectedShape,
  socket,
  isDarkMode,
}: StyleToolbarProps) {
  const colors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#10b981" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Gray", value: "#6b7280" },
    { name: "Black", value: "#1f2937" },
  ];

  const handleColorChange = (color: string, type: "fill" | "stroke") => {
    if (selectedShape) {
      const updates = {
        x: selectedShape.x,
        y: selectedShape.y,
        width: selectedShape.width,
        height: selectedShape.height,
        text: selectedShape.text,
        fill: type === "fill" ? color : selectedShape.fill,
        stroke: type === "stroke" ? color : selectedShape.stroke,
        rotation: selectedShape.rotation,
      };

      sendShapeUpdate(socket, selectedShape.id, updates);
    }
  };

  if (!selectedShape) {
    return (
      <div
        className={`floating-toolbar style-toolbar ${
          isDarkMode ? "dark-mode" : ""
        }`}
      >
        <div className="style-message-compact">🎨</div>
      </div>
    );
  }

  return (
    <div
      className={`floating-toolbar style-toolbar ${
        isDarkMode ? "dark-mode" : ""
      }`}
    >
      <div className="style-section-compact">
        <div className="color-row">
          <span className="color-type-icon" title="Fill Color">
            🎨
          </span>
          <div className="color-grid-compact">
            {colors.slice(0, 4).map((color) => (
              <button
                key={`fill-${color.value}`}
                className={`color-button-compact ${
                  selectedShape.fill === color.value ? "active" : ""
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value, "fill")}
                title={`Fill: ${color.name}`}
              />
            ))}
          </div>
        </div>

        <div className="color-row">
          <span className="color-type-icon" title="Border Color">
            🖼️
          </span>
          <div className="color-grid-compact">
            {colors.slice(0, 4).map((color) => (
              <button
                key={`stroke-${color.value}`}
                className={`color-button-compact ${
                  selectedShape.stroke === color.value ? "active" : ""
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value, "stroke")}
                title={`Border: ${color.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
