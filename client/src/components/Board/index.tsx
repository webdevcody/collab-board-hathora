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
  toggleDarkModeAtom
} from "./atoms/boardAtoms";
import Canvas from "./Canvas";
import { Tool } from "../Toolbar";
import ShapesToolbar from "../ShapesToolbar";
import ZoomToolbar from "../ZoomToolbar";
import StyleToolbar from "../StyleToolbar";
import BoardNavigationToolbar, { BoardInfo } from "../BoardNavigationToolbar";
import { BoardSessionData, SessionClient } from "../../sessionClient";

interface BoardProps {
  userId: string;
  snapshot: BoardSessionData;
  connectionHost: string;
  client: SessionClient;
  boardInfo?: BoardInfo | null;
}

function BoardContent({
  userId,
  snapshot,
  connectionHost,
  client,
  boardInfo
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

  // Add/remove board-active class to body for scroll prevention
  useEffect(() => {
    document.body.classList.add("board-active");
    return () => {
      document.body.classList.remove("board-active");
    };
  }, []);

  // Update selectedShape when shapes array changes to ensure we have the latest data
  useEffect(() => {
    if (selectedShape && snapshot.shapes) {
      const updatedShape = snapshot.shapes.find(
        shape => shape.id === selectedShape.id
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
      client.sendShapeDelete(selectedShape.id);
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
        client={client}
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
            client={client}
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
