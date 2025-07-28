// Common types used across messages
export type ShapeType = "rectangle" | "oval" | "text" | "line" | "arrow";

export type CursorPosition = {
  userId: string;
  x: number;
  y: number;
  timestamp: Date;
};

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  userId: string;
  timestamp: Date;
  text?: string;
  fill?: string;
  stroke?: string;
  rotation?: number; // rotation angle in degrees
};

export type BoardSessionData = {
  connectedUsers: string[];
  cursors: CursorPosition[];
  shapes: Shape[];
};

// Client-to-Server Messages
export type ClientToServerMessage =
  | CursorMoveMessage
  | ShapeCreateMessage
  | ShapeUpdateMessage
  | ShapeDeleteMessage;

export type CursorMoveMessage = {
  type: "cursor_move";
  x: number;
  y: number;
};

export type ShapeCreateMessage = {
  type: "shape_create";
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fill?: string;
  stroke?: string;
};

export type ShapeUpdateMessage = {
  type: "shape_update";
  shapeId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fill?: string;
  stroke?: string;
  rotation?: number;
};

export type ShapeDeleteMessage = {
  type: "shape_delete";
  shapeId: string;
};

// Server-to-Client Messages
export type ServerToClientMessage = BoardSessionData;

// Type guards for message validation
export const isCursorMoveMessage = (
  message: any
): message is CursorMoveMessage => {
  return (
    message.type === "cursor_move" &&
    typeof message.x === "number" &&
    typeof message.y === "number"
  );
};

export const isShapeCreateMessage = (
  message: any
): message is ShapeCreateMessage => {
  return (
    message.type === "shape_create" &&
    typeof message.shapeType === "string" &&
    typeof message.x === "number" &&
    typeof message.y === "number" &&
    typeof message.width === "number" &&
    typeof message.height === "number"
  );
};

export const isShapeUpdateMessage = (
  message: any
): message is ShapeUpdateMessage => {
  return message.type === "shape_update" && typeof message.shapeId === "string";
};

export const isShapeDeleteMessage = (
  message: any
): message is ShapeDeleteMessage => {
  return message.type === "shape_delete" && typeof message.shapeId === "string";
};

export const isClientToServerMessage = (
  message: any
): message is ClientToServerMessage => {
  return (
    isCursorMoveMessage(message) ||
    isShapeCreateMessage(message) ||
    isShapeUpdateMessage(message) ||
    isShapeDeleteMessage(message)
  );
};

export const isServerToClientMessage = (
  message: any
): message is ServerToClientMessage => {
  return (
    message &&
    Array.isArray(message.connectedUsers) &&
    Array.isArray(message.cursors) &&
    Array.isArray(message.shapes)
  );
};
