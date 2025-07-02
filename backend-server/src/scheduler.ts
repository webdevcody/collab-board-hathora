import { HathoraCloud } from "@hathora/cloud-sdk-typescript";

interface Scheduler {
  createRoom(): Promise<string>;
  getRoomHost(roomId: string): Promise<string | null>;
}

class LocalScheduler implements Scheduler {
  private sessionServerHosts: string[];
  private rooms: Map<string, string> = new Map();
  constructor(sessionServerHosts: string) {
    this.sessionServerHosts = sessionServerHosts.split(",").map((host) => host.trim());
  }
  async createRoom(): Promise<string> {
    const roomId = Math.random().toString(36).slice(2);
    const sessionServerHost = this.sessionServerHosts[Math.floor(Math.random() * this.sessionServerHosts.length)];
    this.rooms.set(roomId, sessionServerHost);
    return roomId;
  }
  async getRoomHost(roomId: string): Promise<string | null> {
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
  async getRoomHost(roomId: string): Promise<string | null> {
    try {
      const { exposedPort } = await this.hathora.roomsV2.getConnectionInfo(roomId);
      if (exposedPort == null) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return this.getRoomHost(roomId);
      }
      return `${exposedPort.host}:${exposedPort.port}`;
    } catch (error) {
      return null;
    }
  }
}

export const scheduler = await getScheduler();
async function getScheduler(): Promise<Scheduler> {
  if (process.env.SESSION_SERVER_HOST != null) {
    return new LocalScheduler(process.env.SESSION_SERVER_HOST);
  } else if (process.env.HATHORA_TOKEN != null && process.env.HATHORA_APP_ID != null) {
    return new HathoraScheduler(process.env.HATHORA_TOKEN, process.env.HATHORA_APP_ID);
  } else {
    throw new Error("Missing scheduler configuration");
  }
}
