import HR, { ReadyEvent } from "hr-sdk";
import hrCache from '../../utils/cache';
import { cacheKey } from "../../utils/constant";
import SchedulerInitializer from "../../scheduler/schedulerInitializer";
import logger from "../../lib/winston";
import RoomConfigService from "../../service/RoomConfigService";
import { isPosition } from "../../utils/utils";

class ReadyHandler {
    private readonly roomConfigService: RoomConfigService;
    constructor(private readonly bot: HR, private readonly data: ReadyEvent) {
        this.roomConfigService = new RoomConfigService();
        this.onReady();
    }

    async onReady() {
        console.log(`Bot is Ready to server.`);
        console.info(`Server Info:`);
        console.info(`Room Name: ${this.data.roomInfo.roomName}`);
        console.info(`Owner Id: ${this.data.roomInfo.ownerId}`);
        console.info(`Bot User Id: ${this.data.userId}`);
        console.info(`Connection Id: ${this.data.connectionId}`);
        hrCache.set(cacheKey.roomName, this.data.roomInfo.roomName);
        hrCache.set(cacheKey.ownerId, this.data.roomInfo.ownerId);
        hrCache.set(cacheKey.botId, this.data.userId);
        try {
            const scheduler = new SchedulerInitializer(this.bot);
            scheduler.init();
            const roomConfig = await this.roomConfigService.getRoomConfig();
            if (roomConfig?.startingPosition) {
                if (isPosition(roomConfig?.startingPosition)) {
                    this.bot.action.walk(roomConfig?.startingPosition);
                } else {
                    this.bot.action.sit(roomConfig?.startingPosition);
                }
            }
        } catch (error) {
            logger.error("Error Generated in ready handler", { error })
        }
    }
}
export default ReadyHandler