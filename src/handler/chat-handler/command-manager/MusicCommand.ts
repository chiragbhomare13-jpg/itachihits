import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { sendChat, sendWhisper } from "../../../service/bot/botHelper";
import { chatCommandMap } from "../../../utils/constant";
import MusicRadioApi from "../../../api/MusicRadioApi";
import { PaginationUtil } from "../../../utils/paginationUtil";
import { getCommandPrefix } from "../../../utils/utils";

class MusicCommand implements ChatCommand {
    private readonly musicRadioApi: MusicRadioApi;
    constructor() {
        this.musicRadioApi = new MusicRadioApi();
    }
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Music Command executed", { user, args })
        switch (args[0]) {
            case chatCommandMap.play:
                await this.addToQueue(bot, user, args); break;
            case chatCommandMap.now:
                await this.fetchNowPlaying(bot, user, args); break;
            case chatCommandMap.next:
                await this.fetchUpcomingSong(bot, user, args); break;
            case chatCommandMap.skip:
                await this.skipSong(bot, user, args); break;
            case chatCommandMap.queue:
                await this.getQueueList(bot, user, args); break;
        }
    }

    private async addToQueue(bot: HR, user: User, args: string[]) {
        try {
            if (!args[1]) {
                sendWhisper(user.id, "Enter song name.")
            }
            const songName = args.slice(1).join(" ");
            console.log(songName)
            sendChat(`Adding the song ${songName}`);
            const response = await this.musicRadioApi.addToQueue(songName, user.username);
            sendChat(`\n🎵 ${response.message}\n📻 Song Name: ${response.data.title}\n\n🕺 Requested By: @${response.data.requestedBy}`);
        } catch (error) {
            logger.error("Error getting queue list", { error })
            sendChat("Song Not Found");

        }
    }

    private async fetchNowPlaying(bot: HR, user: User, args: string[]) {
        try {
            const response = await this.musicRadioApi.fetchNowPlaying();
            logger.info("Now Playing");
            sendChat(`\n╰┈➤ 🎶🎶Now Playing🎶🎶  \n\n🎧 Song Name: 「 ✦ ${response.data.title} ✦ 」\n\n🕣 ◀︎ •၊၊||၊|။||||။‌‌‌‌‌၊|• ${response.data.duration}\n\n\n🧟Requested By: @${response.data.requestedBy}\n\nNow vibing to the beats! ~(˘▾˘~)`);
        } catch (error) {
            logger.error("Error getting queue list", { error })
            sendChat("Error getting now playing detail")
        }
    }

    private async fetchUpcomingSong(bot: HR, user: User, args: string[]) {
        try {
            const response = await this.musicRadioApi.fetchUpcoming();
            logger.info("Upcoming song")
            sendChat(`\n🎶🎶Upcoming Song🎶  \n\n🎧 Song Name: ${response.data.title} \n\n🕣 duration: ${response.data.duration}\n\n\n🧟Requested By: @${response.data.requestedBy}\n\nNow vibing to the beats! ~(˘▾˘~)`);
        } catch (error) {
            logger.error("Error getting queue list", { error })
            sendChat("Error getting next song detail")
        }
    }
    private async skipSong(bot: HR, user: User, args: string[]) {
        try {
            const response = await this.musicRadioApi.skipSong();
            logger.info("skip song");
            sendChat(response.message);
        } catch (error) {
            logger.error("Error getting queue list", { error })
            sendChat("Failed to skip song!")
        }

    }
    private async getQueueList(bot: HR, user: User, args: string[]) {
        try {
            const SONGS_PER_PAGE = 5;
            const response = await this.musicRadioApi.fetchQueue();
            const page = args[1] ? Math.max(1, parseInt(args[1])) : 1;

            const result = await PaginationUtil.paginateData({
                data: response.data || [],
                page,
                itemsPerPage: SONGS_PER_PAGE,
                formatItem: (songData: any, index: number) =>
                    `\n${index}. ${songData.title} - Requested By @${songData.requestedBy}\n`
            })
            if (result.isEmpty) {
                sendChat("Queue is empty");
                return;
            }

            if (result.currentPage > result.totalPages) {
                sendChat(`Invalid page number. Total pages available: ${result.totalPages}`);
                return;
            }

            sendChat(`Queue List (Page ${result.currentPage}/${result.totalPages})`);

            result.messages.forEach(message => sendChat(message));

            if (result.totalPages > 1) {
                const prefix = await getCommandPrefix();
                sendChat(`Use ${prefix}-"queue <page_number>" to view other pages (1-${result.totalPages})`);
            }
        } catch (error) {
            logger.error("Error getting queue list", { error });
            sendChat("Error fetching queue list");
        }
    }
}

export default MusicCommand;
