import { HathoraCloud } from "@hathora/cloud-sdk-typescript";

interface Scheduler {
  createRoom(): Promise<string>;
  getRoomUrl(roomId: string): Promise<string | null>;
}

class LocalScheduler implements Scheduler {
  private sessionServerUrls: string[];
  private rooms: Map<string, string> = new Map();
  constructor(sessionServerUrls: string) {
    this.sessionServerUrls = sessionServerUrls.split(",").map((url) => url.trim());
  }
  async createRoom(): Promise<string> {
    const roomId = Math.random().toString(36).slice(2);
    const sessionServerUrl = this.sessionServerUrls[Math.floor(Math.random() * this.sessionServerUrls.length)];
    this.rooms.set(roomId, sessionServerUrl);
    return roomId;
  }
  async getRoomUrl(roomId: string): Promise<string | null> {
    return this.rooms.get(roomId) ?? null;
  }
}

class HathoraScheduler implements Scheduler {
  private hathora: HathoraCloud;
  constructor(hathoraDevToken: string, appId: string) {
    this.hathora = new HathoraCloud({ hathoraDevToken, appId });
  }
  async createRoom(): Promise<string> {
    const res = await this.hathora.roomsV2.createRoom({ region: "Chicago" });
    return res.roomId;
  }
  async getRoomUrl(roomId: string): Promise<string | null> {
    try {
      const { exposedPort } = await this.hathora.roomsV2.getConnectionInfo(roomId);
      if (exposedPort == null) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return this.getRoomUrl(roomId);
      }
      return `${exposedPort.host}:${exposedPort.port}`;
    } catch (error) {
      return null;
    }
  }
}

export const scheduler = await getScheduler();
async function getScheduler(): Promise<Scheduler> {
  if (process.env.SESSION_SERVER_URLS != null) {
    return new LocalScheduler(process.env.SESSION_SERVER_URLS);
  } else if (process.env.HATHORA_TOKEN != null && process.env.HATHORA_APP_ID != null) {
    return new HathoraScheduler(process.env.HATHORA_TOKEN, process.env.HATHORA_APP_ID);
  } else {
    throw new Error("Missing scheduler configuration");
  }
}
