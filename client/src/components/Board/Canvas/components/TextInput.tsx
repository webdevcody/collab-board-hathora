import React, { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  activeTextInputAtom,
  textInputValueAtom,
  clearTextInputAtom,
  isEditingTextAtom,
  editingTextShapeAtom,
  submitTextInputAtom,
} from "../../atoms/canvasAtoms";
import { selectedFillColorAtom, isDarkModeAtom } from "../../atoms/boardAtoms";

import { SessionClient } from "../../../../sessionClient";

interface TextInputProps {
  client: SessionClient;
  onShapeCreated?: () => void;
}

export default function TextInput({ client, onShapeCreated }: TextInputProps) {
  const [activeTextInput, setActiveTextInput] = useAtom(activeTextInputAtom);
  const [textInputValue, setTextInputValue] = useAtom(textInputValueAtom);
  const [selectedFillColor] = useAtom(selectedFillColorAtom);
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const [isEditingText] = useAtom(isEditingTextAtom);
  const [editingTextShape] = useAtom(editingTextShapeAtom);
  const [submitTextInput, setSubmitTextInput] = useAtom(submitTextInputAtom);
  const clearTextInput = useSetAtom(clearTextInputAtom);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea and position cursor at the end when editing existing text
  useEffect(() => {
    if (activeTextInput && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();

      if (isEditingText && textInputValue) {
        // Position cursor at the end of the text when editing
        setTimeout(() => {
          textarea.setSelectionRange(textInputValue.length, textInputValue.length);
        }, 0);
      }
    }
  }, [activeTextInput, isEditingText, textInputValue]);

  // Handle external submit trigger
  useEffect(() => {
    if (submitTextInput) {
      handleTextSubmit();
      setSubmitTextInput(false);
    }
  }, [submitTextInput]);

  if (!activeTextInput) {
    return null;
  }

  const handleTextSubmit = () => {
    if (textInputValue.trim()) {
      if (isEditingText && editingTextShape) {
        // Update existing text shape
        client.sendShapeUpdate(editingTextShape.id, {
          x: editingTextShape.x,
          y: editingTextShape.y,
          width: editingTextShape.width,
          height: editingTextShape.height,
          fill: editingTextShape.fill,
          stroke: editingTextShape.stroke,
          text: textInputValue.trim(),
          rotation: editingTextShape.rotation,
        });
      } else {
        // Create new text shape
        client.sendShapeCreate(
          "text",
          activeTextInput.x,
          activeTextInput.y,
          activeTextInput.width,
          activeTextInput.height,
          {
            text: textInputValue.trim(),
            fill: selectedFillColor,
          },
        );
        // Notify that shape was created
        onShapeCreated?.();
      }
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

  // Use the shape's fill color when editing, otherwise use selected fill color
  const textColor = isEditingText && editingTextShape ? editingTextShape.fill : selectedFillColor;

  // Calculate font size to match the text shape rendering
  const fontSize = Math.min(activeTextInput.height / 2, 24);

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
        ref={textareaRef}
        value={textInputValue}
        onChange={(e) => setTextInputValue(e.target.value)}
        onKeyDown={handleTextKeyDown}
        onBlur={handleTextSubmit}
        style={{
          width: "100%",
          height: "100%",
          border: isEditingText ? "2px dashed #667eea" : `2px solid ${textColor}`,
          outline: "none",
          background: "transparent",
          color: textColor,
          fontSize: `${fontSize}px`,
          fontWeight: 500,
          fontFamily: "inherit",
          resize: "none",
          padding: "8px",
          borderRadius: isEditingText ? "0px" : "4px",
          boxShadow: isEditingText ? "none" : "0 2px 8px rgba(0, 0, 0, 0.15)",
          // Center the text like the text shape
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minWidth: "100px",
          minHeight: "40px",
        }}
        placeholder={isEditingText ? "Edit your text..." : "Type your text..."}
      />
    </div>
  );
}
