import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { sendWhisper } from "../../../service/bot/botHelper";
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
            const banListData = await this.musicApi.getAllBlockList();
            const banListArr = banListData.data;
            if (banListArr.length <= 0) {
                sendWhisper(user.id, "No song is banned.");
                return;
            }
            const songIndex = parseInt(args[1]);
            if (isNaN(songIndex) || songIndex < 0 || songIndex >= banListArr.length) {
                sendWhisper(user.id, `Invalid index. Please choose between 1 and ${banListArr.length}`);
                return;
            }
            const response = await this.musicApi.unblockBlockListByIndex(songIndex);
            sendWhisper(user.id, response.message ?? "Song unbanned Successfully!")
        } catch (error: any) {
            logger.error("Error unbanning song by index", { error });
            sendWhisper(user.id, error?.message ?? "Failed to unban song.");
        }
    }

    async unbanSongByName(bot: HR, user: User, args: string[]): Promise<void> {
        const songName = args.slice(1).join(" ");
        try {
            if (!songName) {
                sendWhisper(user.id, "Enter Song name to unban.")
                return;
            }

            const response = await this.musicApi.unblockSongBySongName(songName);
            sendWhisper(user.id, response?.message);
        } catch (error: any) {
            logger.error("Error unbanning song by name", { error });
            sendWhisper(user.id, error?.message ?? `Error banning the ${songName} song`)
        }
    }

    async unbanAllSong(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const response = await this.musicApi.deleteAllBlockList();
            sendWhisper(user.id, response.message ?? "All songs unbanned successfully!");
        } catch (error: any) {
            logger.error("Error unbanning all songs", { error })
            sendWhisper(user.id, error?.message ?? "Error Unbanning all songs");
        }
    }
}

export default UnbanCommand;