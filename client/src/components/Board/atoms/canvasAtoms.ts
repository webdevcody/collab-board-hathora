import { atom } from "jotai";
import { Tool } from "../../../components/Toolbar";
import { Shape } from "../../../sessionClient";

// Drawing State Atoms
export const isDrawingAtom = atom<boolean>(false);
export const drawStartAtom = atom<{ x: number; y: number } | null>(null);

export const previewShapeAtom = atom<{
  x: number;
  y: number;
  width: number;
  height: number;
  type: Tool;
} | null>(null);

// Text Input State Atoms
export const activeTextInputAtom = atom<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);

export const textInputValueAtom = atom<string>("");

// Text Editing State Atoms
export const isEditingTextAtom = atom<boolean>(false);
export const editingTextShapeAtom = atom<Shape | null>(null);

// Text submission trigger atom
export const submitTextInputAtom = atom<boolean>(false);

// Derived atoms for text operations
export const clearTextInputAtom = atom(null, (get, set) => {
  set(activeTextInputAtom, null);
  set(textInputValueAtom, "");
  set(isEditingTextAtom, false);
  set(editingTextShapeAtom, null);
  set(submitTextInputAtom, false);
});

export const setTextInputAtom = atom(
  null,
  (
    get,
    set,
    textInput: { x: number; y: number; width: number; height: number }
  ) => {
    set(activeTextInputAtom, textInput);
    set(textInputValueAtom, "");
    set(isEditingTextAtom, false);
    set(editingTextShapeAtom, null);
    set(submitTextInputAtom, false);
  }
);

// New atom for setting up text editing mode
export const setTextEditingAtom = atom(null, (get, set, shape: Shape) => {
  set(activeTextInputAtom, {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height
  });
  set(textInputValueAtom, shape.text || "");
  set(isEditingTextAtom, true);
  set(editingTextShapeAtom, shape);
  set(submitTextInputAtom, false);
});

// Atom to trigger text submission
export const triggerTextSubmitAtom = atom(null, (get, set) => {
  set(submitTextInputAtom, true);
});
