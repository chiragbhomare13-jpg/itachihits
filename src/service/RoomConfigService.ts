import { RoomConfig } from "../interface/models";
import logger from "../lib/winston";
import RoomConfigRepository from "../repositories/RoomConfigRepository";
import hrCache from "../utils/cache";
import CommonConfigService from "./CommonConfigService";

class RoomConfigService {
    private readonly roomConfigRepo: RoomConfigRepository;
    private readonly commonConfigService: CommonConfigService;
    constructor() {
        this.roomConfigRepo = new RoomConfigRepository();
        this.commonConfigService = new CommonConfigService();
    }

    async getRoomConfig(): Promise<RoomConfig | null> {
        try {
            const roomId = await this.commonConfigService.getActiveRoomId();
            let roomConfig = await this.roomConfigRepo.findById(roomId);
            if (!roomConfig) {
                const payload: RoomConfig = {
                    id: roomId,
                    roomName: hrCache.get('roomName'),
                    roomOwnerId: hrCache.get('ownerId'),
                    roomId: roomId,
                }
                roomConfig = await this.roomConfigRepo.create(payload);
            }
            return roomConfig;
        } catch (error) {
            logger.error("Error Creating or fetching Room Config", { error })
            throw error;
        }
    }
   
}

export default RoomConfigService;