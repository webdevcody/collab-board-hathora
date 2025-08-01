import { atom } from "jotai";
import { Tool } from "../../../components/Toolbar";
import { Shape } from "../../../sessionClient";

// UI State Atoms
export const activeToolAtom = atom<Tool>("select");
export const selectedShapeAtom = atom<Shape | null>(null);
export const showToolbarsAtom = atom<boolean>(true);
export const isDarkModeAtom = atom<boolean>(false);
export const positionOverrideAtom = atom<{ x: number; y: number } | null>(null);

// Color Selection State
export const selectedFillColorAtom = atom<string>("#3b82f6"); // Default blue color

// Camera State Atoms
export const cameraOffsetAtom = atom<{ x: number; y: number }>({
  x: 0,
  y: 0
});
export const cameraZoomAtom = atom<number>(1);

// Derived atoms for camera controls
export const zoomInAtom = atom(null, (get, set) => {
  const currentZoom = get(cameraZoomAtom);
  set(cameraZoomAtom, Math.min(currentZoom * 1.2, 5)); // Max 5x zoom
});

export const zoomOutAtom = atom(null, (get, set) => {
  const currentZoom = get(cameraZoomAtom);
  set(cameraZoomAtom, Math.max(currentZoom / 1.2, 0.1)); // Min 0.1x zoom
});

export const zoomResetAtom = atom(null, (get, set) => {
  set(cameraZoomAtom, 1);
  set(cameraOffsetAtom, { x: 0, y: 0 });
});

export const toggleDarkModeAtom = atom(null, (get, set) => {
  const current = get(isDarkModeAtom);
  set(isDarkModeAtom, !current);
});
