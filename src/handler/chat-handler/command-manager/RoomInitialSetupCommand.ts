import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { getUserPosition, isOwner, isPosition, separateStringAndNumbers } from "../../../utils/utils";
import RoomConfigRepository from "../../../repositories/RoomConfigRepository";
import { RoomConfig } from "../../../interface/models";
import CommonConfigRepository from "../../../repositories/CommonConfigRepository";
import { Options } from "../../../config/options";

class RoomInitialSetupCommand implements ChatCommand {
    private readonly roomConfigRepo: RoomConfigRepository;
    private readonly commonConfigRepo: CommonConfigRepository;
    constructor() {
        this.roomConfigRepo = new RoomConfigRepository();
        this.commonConfigRepo = new CommonConfigRepository();
    }
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Hello Room Initial Setup Command executed", { user, args })
        if (!isOwner) {
            bot.action.whisper({ whisperTargetId: user.id, message: "Only the room owner can execute this command." });
            return;
        }
        try {
            const commonConfig = await this.commonConfigRepo.findById(Options.COMMON_CONFIG_ID);
            if (!commonConfig) {
                bot.action.whisper({ whisperTargetId: user.id, message: "Common Config not found." });
                return;
            }
            const roomConfig = await this.roomConfigRepo.findById(commonConfig.activeRoomId);
            if (!roomConfig) {
                bot.action.whisper({ whisperTargetId: user.id, message: "Room Config not found." });
                return;
            }

            switch (args[1]) {
                case "start":
                    return await this.setupStartPosition(bot, user, args, roomConfig);
            }
        } catch (error) {
            logger.error("Error generated in Room Initial Setup Command", { error })
        }
    }

    async setupStartPosition(bot: HR, user: User, _args: string[], roomConfig: RoomConfig) {
        const userPosition = await getUserPosition(bot, user.id);
        console.log(userPosition);
        if (userPosition) {
            await this.roomConfigRepo.update(roomConfig.id, { startingPosition: userPosition });
            if (isPosition(userPosition)) {
                bot.action.walk(userPosition);
            } else {
                bot.action.sit(userPosition)
            }
            bot.action.whisper({ whisperTargetId: user.id, message: "Bot Starting Positon Set" });
        }
    }
}

export default RoomInitialSetupCommand;