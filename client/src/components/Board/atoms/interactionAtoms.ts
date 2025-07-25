import { atom } from "jotai";
import { Shape } from "../../../sessionClient";
import {
  ResizeHandle,
  LinePointHandle,
} from "../../../components/SelectionHandles";

// Dragging State Atoms
export const isDraggingAtom = atom<boolean>(false);
export const dragStartAtom = atom<{ x: number; y: number } | null>(null);
export const dragOffsetAtom = atom<{ x: number; y: number } | null>(null);
export const lastDragUpdateAtom = atom<number>(0);

// Panning State Atoms
export const isPanningAtom = atom<boolean>(false);
export const panStartAtom = atom<{ x: number; y: number } | null>(null);
export const isSpacePressedAtom = atom<boolean>(false);

// Resizing State Atoms
export const isResizingAtom = atom<boolean>(false);
export const resizeHandleAtom = atom<ResizeHandle | null>(null);
export const resizeStartAtom = atom<{
  x: number;
  y: number;
  originalShape: Shape;
} | null>(null);

// Rotation State Atoms
export const isRotatingAtom = atom<boolean>(false);
export const rotationStartAtom = atom<{
  angle: number;
  originalRotation: number;
} | null>(null);

// Line Point Dragging State Atoms
export const isLinePointDraggingAtom = atom<boolean>(false);
export const linePointHandleAtom = atom<LinePointHandle | null>(null);
export const linePointStartAtom = atom<{
  x: number;
  y: number;
  originalShape: Shape;
} | null>(null);

// Derived atoms for resetting interaction states
export const resetDragStateAtom = atom(null, (get, set) => {
  set(isDraggingAtom, false);
  set(dragStartAtom, null);
  set(dragOffsetAtom, null);
});

export const resetPanStateAtom = atom(null, (get, set) => {
  set(isPanningAtom, false);
  set(panStartAtom, null);
});

export const resetResizeStateAtom = atom(null, (get, set) => {
  set(isResizingAtom, false);
  set(resizeHandleAtom, null);
  set(resizeStartAtom, null);
});

export const resetRotationStateAtom = atom(null, (get, set) => {
  set(isRotatingAtom, false);
  set(rotationStartAtom, null);
});

export const resetLinePointStateAtom = atom(null, (get, set) => {
  set(isLinePointDraggingAtom, false);
  set(linePointHandleAtom, null);
  set(linePointStartAtom, null);
});

export const resetAllInteractionStatesAtom = atom(null, (get, set) => {
  set(resetDragStateAtom);
  set(resetPanStateAtom);
  set(resetResizeStateAtom);
  set(resetRotationStateAtom);
  set(resetLinePointStateAtom);
});
