import { atom } from "jotai";
import { Tool } from "../../../components/Toolbar";

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

// Derived atoms for text operations
export const clearTextInputAtom = atom(null, (get, set) => {
  set(activeTextInputAtom, null);
  set(textInputValueAtom, "");
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
  }
);
