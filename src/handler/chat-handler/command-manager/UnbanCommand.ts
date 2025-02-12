import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { sendChat } from "../../../service/bot/botHelper";
import MusicRadioApi from "../../../api/MusicRadioApi";
import { chatCommandMap } from "../../../utils/constant";

class UnbanCommand implements ChatCommand {
    private readonly musicApi: MusicRadioApi;
    constructor() {
        this.musicApi = new MusicRadioApi();
    }
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Unban Command executed", { user, args })
        switch (args[0]) {
            case chatCommandMap.unbanat:
                this.unbanSongByIndex(bot, user, args); break;
            case chatCommandMap.unbanname:
                this.unbanSongByName(bot, user, args); break;
            case chatCommandMap.unbanall:
                this.unbanAllSong(bot, user, args); break;
        }
    }
    async unbanSongByIndex(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            
        } catch (error) {

        }
    }

    async unbanSongByName(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async unbanAllSong(bot: HR, user: User, args: string[]): Promise<void> {
        try {

        } catch (error) {

        }
    }
}

export default UnbanCommand;