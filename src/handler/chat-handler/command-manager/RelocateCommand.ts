import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import { cacheKey, chatCommandMap } from "../../../utils/constant";
import { isBotDesignerAndMod, wait } from "../../../utils/utils";
import logger from "../../../lib/winston";
import serverConfig from "../../../config/server-config";
import { sendWhisper } from "../../../service/bot/botHelper";
import CommonConfigService from "../../../service/CommonConfigService";
import SchedulerInitializer from "../../../scheduler/schedulerInitializer";
import init from "../../../seed";
import hrCache from "../../../utils/cache";

class ReloateCommand implements ChatCommand {
    private readonly commonConfigService: CommonConfigService;
    constructor() {
        this.commonConfigService = new CommonConfigService();
    }
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Relocate command executed", { user, args });
        if (args[0] === chatCommandMap.relocate) {
            this.changeRoom(bot, user, args);
        } else {
            sendWhisper(user.id, "Looks like some kind of bug! Report to the owner");
        }
    }

    private async changeRoom(bot: HR, user: User, args: string[]) {
        try {

            const roomId = args[1];
            if (!roomId) {
                return sendWhisper(user.id, "Please provide a room Id");
            }
            if (roomId.length !== 24) {
                return sendWhisper(user.id, "Invalid Room Id");
            }
            sendWhisper(user.id, "Please wait while we are checking all the requirements.")
            const permission = await isBotDesignerAndMod(roomId);
            if (!permission.designer || !permission.moderator) {
                sendWhisper(user.id, "Check the permission, Bot should have mod and designer permission in this room")
                sendWhisper(user.id, `mod - ${permission.designer} | designer ${permission.moderator}`)
            }

            sendWhisper(user.id, "Change Room in Progress")

            // change active room id.
            const newActiveRoomId = await this.commonConfigService.updateActiveRoomId(roomId);
            if (!newActiveRoomId) {
                sendWhisper(user.id, "Failed to change room, please check the room id");
                return;
            }
            logger.info("New Room Relocation Started", { newActiveRoomId });

            // Update the action room id in the cache.
            hrCache.set(cacheKey.roomId, newActiveRoomId);

            // stop all scheduler.
            const schedulerInitializer = new SchedulerInitializer();
            await schedulerInitializer.stopAndRemoveAll();

            // Initialize Seeder
            await init();

            // Relocate the user and Bot to new room.
            sendWhisper(user.id, "Relocation process Initialized! Relocating you to the new room in 5 sec");
            await wait(5000);
            bot.action.moveUserToRoom({ roomId: roomId, userId: user.id });
            await wait(1000);
            await bot.changeRoom(serverConfig.HIGHRISE_TOKEN, roomId);
            sendWhisper(user.id, "Relocation process completed!");
        } catch (error) {
            logger.error("Error while checking the room permission for bot", { error });
            sendWhisper(user.id, "Room Change Failed");
        }
    }
}

export default ReloateCommand;