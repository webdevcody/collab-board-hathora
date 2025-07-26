const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export interface BoardData {
  shapes: Array<{
    id: string;
    type: "rectangle" | "oval" | "text" | "line" | "arrow";
    x: number;
    y: number;
    width: number;
    height: number;
    userId: string;
    timestamp: string;
    text?: string;
    fill?: string;
    stroke?: string;
    rotation?: number;
  }>;
  cursors: Array<{
    userId: string;
    x: number;
    y: number;
    timestamp: string;
  }>;
}

export interface Board {
  id: number;
  name: string;
  userId: string;
  data: BoardData;
  hathoraRoomId: string;
  createdAt: string;
  updatedAt: string;
}

export class BoardApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  async getBoardByRoomId(roomId: string): Promise<Board | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/boards/by-room/${roomId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Board not found
        }
        throw new Error(`Failed to get board info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error getting board by room ID ${roomId}:`, error);
      throw error;
    }
  }

  async updateBoardData(boardId: number, data: BoardData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/boards/${boardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update board data: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error updating board data for board ${boardId}:`, error);
      throw error;
    }
  }
}

// Export a default instance
export const boardApiClient = new BoardApiClient();
