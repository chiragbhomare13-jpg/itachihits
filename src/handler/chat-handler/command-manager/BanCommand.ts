import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { chatCommandMap } from "../../../utils/constant";
import MusicRadioApi from "../../../api/MusicRadioApi";
import { sendWhisper } from "../../../service/bot/botHelper";
import { PaginationUtil } from "../../../utils/paginationUtil";
import { getCommandPrefix } from "../../../utils/utils";

class BanCommand implements ChatCommand {
    private readonly musicApi: MusicRadioApi;
    constructor() {
        this.musicApi = new MusicRadioApi();
    }
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Ban Command executed", { user, args })
        switch (args[0]) {
            case chatCommandMap.ban:
                this.banCurrentSong(bot, user, args); break;
            case chatCommandMap.banname:
                this.banSongByName(bot, user, args); break;
            case chatCommandMap.banlist:
                this.getAllBanedSong(bot, user, args); break;
        }

    }
    async banCurrentSong(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const response = await this.musicApi.blockCurrentSong(user.username);
            sendWhisper(user.id, response.message);
        } catch (error: any) {
            logger.error("Error Occured while banning current song", { error })
            sendWhisper(user.id, error?.message ?? "Error banning current song.");
        }
    }

    async banSongByName(bot: HR, user: User, args: string[]): Promise<void> {
        const songName = args.slice(1).join(" ");
        try {
            if (!songName) {
                sendWhisper(user.id, "Enter Song name to ban.")
                return;
            }

            const response = await this.musicApi.blockSongByName(songName, user.username);
            sendWhisper(user.id, response?.message);
        } catch (error: any) {
            sendWhisper(user.id, error?.message ?? `Error banning the ${songName} song`)
        }
    }

    async getAllBanedSong(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const response = await this.musicApi.getAllBlockList();
            const size = 5;
            const page = args[1] ? Math.max(1, parseInt(args[1])) : 1;
            const result = await PaginationUtil.paginateData({
                data: response.data || [],
                page,
                itemsPerPage: size,
                formatItem: (songData: { songName: string, requestedBy: string }, index: number) =>
                    `\n${index}. ${songData.songName} - bannedBy: @${songData.requestedBy}`
            });
            if (result.isEmpty) {
                sendWhisper(user.id, "Ban List is empty!")
                return;
            }
            if (result.currentPage > result.totalPages) {
                sendWhisper(user.id, `Invalid page number. Total Pages available: ${result.totalPages}`);
                return;
            }
            sendWhisper(user.id, `Ban List (page ${result.currentPage}/${result.totalPages})`);
            result.messages.forEach(message => sendWhisper(user.id, `\n${message}`));
            if (result.totalPages > 1) {
                const prefix = await getCommandPrefix();
                sendWhisper(user.id, `Use "${prefix}banlist <page_number>" to view other pages (1-${result.totalPages})`);
            }
        } catch (error) {
            logger.error("Error getting ban list", { error })
            sendWhisper(user.id, "Error getting ban list")
        }
    }
}

export default BanCommand;