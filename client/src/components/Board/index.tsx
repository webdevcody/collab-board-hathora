import React, { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Provider } from "jotai";
import {
  activeToolAtom,
  selectedShapeAtom,
  cameraZoomAtom,
  isDarkModeAtom,
  showToolbarsAtom,
  zoomInAtom,
  zoomOutAtom,
  zoomResetAtom,
  toggleDarkModeAtom,
} from "./atoms/boardAtoms";
import Canvas from "./Canvas";
import { Tool } from "../Toolbar";
import ShapesToolbar from "../ShapesToolbar";
import ZoomToolbar from "../ZoomToolbar";
import StyleToolbar from "../StyleToolbar";
import BoardNavigationToolbar, { BoardInfo } from "../BoardNavigationToolbar";
import { BoardSessionData, sendShapeDelete } from "../../sessionClient";

interface BoardProps {
  userId: string;
  snapshot: BoardSessionData;
  connectionHost: string;
  socket: WebSocket;
  boardInfo?: BoardInfo | null;
}

function BoardContent({
  userId,
  snapshot,
  connectionHost,
  socket,
  boardInfo,
}: BoardProps) {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const [selectedShape, setSelectedShape] = useAtom(selectedShapeAtom);
  const cameraZoom = useAtomValue(cameraZoomAtom);
  const isDarkMode = useAtomValue(isDarkModeAtom);
  const showToolbars = useAtomValue(showToolbarsAtom);

  const zoomIn = useSetAtom(zoomInAtom);
  const zoomOut = useSetAtom(zoomOutAtom);
  const zoomReset = useSetAtom(zoomResetAtom);
  const toggleDarkMode = useSetAtom(toggleDarkModeAtom);

  // Update selectedShape when shapes array changes to ensure we have the latest data
  useEffect(() => {
    if (selectedShape && snapshot.shapes) {
      const updatedShape = snapshot.shapes.find(
        (shape) => shape.id === selectedShape.id
      );
      if (updatedShape) {
        setSelectedShape(updatedShape);
      } else {
        // Shape was deleted, clear selection
        setSelectedShape(null);
      }
    }
  }, [snapshot.shapes, selectedShape?.id, setSelectedShape]);

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  const handleDeleteShape = () => {
    if (selectedShape) {
      sendShapeDelete(socket, selectedShape.id);
      setSelectedShape(null);
    }
  };

  return (
    <div className="board-container">
      {/* Board Navigation Toolbar */}
      <BoardNavigationToolbar
        boardInfo={boardInfo || null}
        isDarkMode={isDarkMode}
        visible={showToolbars}
        connectedUsers={snapshot.connectedUsers}
        currentUserId={userId}
      />

      {/* Full-screen canvas */}
      <Canvas
        userId={userId}
        cursors={snapshot.cursors}
        shapes={snapshot.shapes}
        socket={socket}
      />

      {/* Floating Toolbars */}
      {showToolbars && (
        <>
          <ShapesToolbar
            activeTool={activeTool}
            onToolChange={handleToolChange}
            selectedShape={selectedShape}
            onDeleteShape={handleDeleteShape}
            isDarkMode={isDarkMode}
          />

          <ZoomToolbar
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomReset={zoomReset}
            zoomLevel={cameraZoom}
            isDarkMode={isDarkMode}
          />

          <StyleToolbar
            selectedShape={selectedShape}
            socket={socket}
            isDarkMode={isDarkMode}
          />
        </>
      )}

      {/* Dark Mode Toggle Button */}
      <button
        className={`dark-mode-toggle ${isDarkMode ? "dark-mode" : ""}`}
        onClick={toggleDarkMode}
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

export default function Board(props: BoardProps) {
  return (
    <Provider>
      <BoardContent {...props} />
    </Provider>
  );
}
