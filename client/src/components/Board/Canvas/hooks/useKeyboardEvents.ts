import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeToolAtom, selectedShapeAtom } from "../../atoms/boardAtoms";
import { activeTextInputAtom } from "../../atoms/canvasAtoms";
import {
  isSpacePressedAtom,
  isPanningAtom,
  resetPanStateAtom
} from "../../atoms/interactionAtoms";
import { Tool } from "../../../../components/Toolbar";
import { SessionClient } from "../../../../sessionClient";

export const useKeyboardEvents = (client: SessionClient) => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const [selectedShape, setSelectedShape] = useAtom(selectedShapeAtom);
  const activeTextInput = useAtomValue(activeTextInputAtom);
  const [isSpacePressed, setIsSpacePressed] = useAtom(isSpacePressedAtom);
  const isPanning = useAtomValue(isPanningAtom);
  const resetPanState = useSetAtom(resetPanStateAtom);

  const handleKeyDown = (e: KeyboardEvent) => {
    // Space key for panning mode
    if (e.key === " " && !activeTextInput && !isSpacePressed) {
      e.preventDefault();
      setIsSpacePressed(true);
      return;
    }

    // Tool hotkeys (only when not typing in text input)
    if (!activeTextInput) {
      switch (e.key.toLowerCase()) {
        case "l":
          e.preventDefault();
          setActiveTool("line");
          return;
        case "a":
          e.preventDefault();
          setActiveTool("arrow");
          return;
        case "o":
          e.preventDefault();
          setActiveTool("oval");
          return;
        case "r":
          e.preventDefault();
          setActiveTool("rectangle");
          return;
        case "t":
          e.preventDefault();
          setActiveTool("text");
          return;
        case "c":
          e.preventDefault();
          setActiveTool("select");
          return;
      }
    }

    // Delete selected shape with Delete or Backspace key
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      selectedShape &&
      !activeTextInput
    ) {
      e.preventDefault();
      client.sendShapeDelete(selectedShape.id);
      setSelectedShape(null); // Clear selection
    }
    // Escape key to deselect
    else if (e.key === "Escape" && selectedShape && !activeTextInput) {
      setSelectedShape(null);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      setIsSpacePressed(false);
      // Stop panning if space is released
      if (isPanning) {
        resetPanState();
      }
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedShape, activeTextInput, isSpacePressed, isPanning]);

  return {
    handleKeyDown,
    handleKeyUp
  };
};
