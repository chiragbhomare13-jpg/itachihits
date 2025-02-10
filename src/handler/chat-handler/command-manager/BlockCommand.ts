import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { sendWhisper } from "../../../service/bot/botHelper";

class BlockCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Block Command executed", { user, args })
        const target = args[1];
        if(!target) {
            sendWhisper(user.id, "invalid command.\nValid command:\nblock now\nblock list\nblock <song_name>");
        }
        if(args[1] === "now"){
            await this.blockCurrentSong(bot, user, args);
        } else if (target === "list"){
            await this.getAllBlockedSong(bot, user, args);
        } else {
            await this.blockSongByName(bot, user, args);
        }
    }
    async blockCurrentSong(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async blockSongByName(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async getAllBlockedSong(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }
}

export default BlockCommand;