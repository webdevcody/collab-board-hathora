import { HathoraCloud } from "@hathora/cloud-sdk-typescript";

class LocalScheduler {
  private sessionServerUrl: string;
  constructor(sessionServerUrl: string) {
    this.sessionServerUrl = sessionServerUrl;
  }
  async createRoom(roomId?: string, roomConfig?: string) {
    return roomId ?? Math.random().toString(36).slice(2);
  }
  async getRoomUrl(roomId: string) {
    return this.sessionServerUrl;
  }
}

class HathoraScheduler {
  private hathora: HathoraCloud;
  constructor(hathoraDevToken: string, appId: string) {
    this.hathora = new HathoraCloud({ hathoraDevToken, appId });
  }
  async createRoom(roomId?: string, roomConfig?: string) {
    const res = await this.hathora.roomsV2.createRoom({ region: "Chicago", roomConfig }, undefined, roomId);
    return res.roomId;
  }
  async getRoomUrl(roomId: string): Promise<string | null> {
    try {
      const { exposedPort, processId } = await this.hathora.roomsV2.resumeRoom(roomId);

      if (exposedPort == null || processId == null) {
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
async function getScheduler() {
  if (process.env.SESSION_SERVER_URL != null) {
    return new LocalScheduler(process.env.SESSION_SERVER_URL);
  } else if (process.env.HATHORA_TOKEN != null && process.env.HATHORA_APP_ID != null) {
    return new HathoraScheduler(process.env.HATHORA_TOKEN, process.env.HATHORA_APP_ID);
  } else {
    throw new Error("Missing scheduler configuration");
  }
}
