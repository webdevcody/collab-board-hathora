import React from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  activeTextInputAtom,
  textInputValueAtom,
  clearTextInputAtom,
} from "../../atoms/canvasAtoms";
import { selectedFillColorAtom, isDarkModeAtom } from "../../atoms/boardAtoms";

import { sendShapeCreate } from "../../../../sessionClient";

interface TextInputProps {
  socket: WebSocket;
  onShapeCreated?: () => void;
}

export default function TextInput({ socket, onShapeCreated }: TextInputProps) {
  const [activeTextInput, setActiveTextInput] = useAtom(activeTextInputAtom);
  const [textInputValue, setTextInputValue] = useAtom(textInputValueAtom);
  const [selectedFillColor] = useAtom(selectedFillColorAtom);
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const clearTextInput = useSetAtom(clearTextInputAtom);

  if (!activeTextInput) {
    return null;
  }

  const handleTextSubmit = () => {
    if (textInputValue.trim()) {
      sendShapeCreate(
        socket,
        "text",
        activeTextInput.x,
        activeTextInput.y,
        activeTextInput.width,
        activeTextInput.height,
        {
          text: textInputValue.trim(),
          fill: selectedFillColor,
        }
      );
      // Notify that shape was created
      onShapeCreated?.();
    }
    clearTextInput();
  };

  const handleTextCancel = () => {
    clearTextInput();
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleTextCancel();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: activeTextInput.x,
        top: activeTextInput.y,
        width: activeTextInput.width,
        height: activeTextInput.height,
        zIndex: 1001,
      }}
    >
      <textarea
        value={textInputValue}
        onChange={(e) => setTextInputValue(e.target.value)}
        onKeyDown={handleTextKeyDown}
        onBlur={handleTextSubmit}
        autoFocus
        style={{
          width: "100%",
          height: "100%",
          border: `2px solid ${selectedFillColor}`,
          outline: "none",
          background: "transparent",
          color: selectedFillColor,
          fontSize: "16px",
          fontWeight: 500,
          fontFamily: "inherit",
          resize: "none",
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
        placeholder="Type your text..."
      />
    </div>
  );
}
