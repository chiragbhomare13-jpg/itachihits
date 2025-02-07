import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { sendChat } from "../../../service/bot/botHelper";

class UnblockCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Unblock Command executed", { user, args })
        const target = args[1];
        if (!isNaN(+target)) {
            await this.unblockSongByIndex(bot, user, args);
        } else if (target === "all") {
            await this.unblockAllSong(bot, user, args);
        }
        else {
            await this.unblockSongByName(bot, user, args);
        }
    }
    async unblockSongByIndex(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async unblockSongByName(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async unblockAllSong(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }
}

export default UnblockCommand;