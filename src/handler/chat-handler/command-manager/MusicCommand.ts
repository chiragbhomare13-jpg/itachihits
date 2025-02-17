import HR, { User } from "hr-sdk";
import { ChatCommand, supportedPlatform } from "../../../interface";
import logger from "../../../lib/winston";
import { sendChat, sendWhisper } from "../../../service/bot/botHelper";
import { chatCommandMap } from "../../../utils/constant";
import MusicRadioApi from "../../../api/MusicRadioApi";
import { PaginationUtil } from "../../../utils/paginationUtil";
import { getCommandPrefix, getRandomFromArray, usernameExtractor, wait } from "../../../utils/utils";
import UserService from "../../../service/UserService";
import MusicService from "../../../service/MusicService";
import { musicVibeMessage } from "../../../utils/store";

class MusicCommand implements ChatCommand {
    private readonly musicRadioApi: MusicRadioApi;

    constructor() {
        this.musicRadioApi = new MusicRadioApi();
    }

    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Music Command executed", { user, args })
        switch (args[0]) {
            case chatCommandMap.play:
            case chatCommandMap.p:
                await this.addToQueue(bot, user, args); break;
            case chatCommandMap.fplay:
            case chatCommandMap.fp:
                await this.addToQueue(bot, user, args, true); break;
            case chatCommandMap.playyt:
            case chatCommandMap.pyt:
                await this.addToQueue(bot, user, args, true, 'youtube'); break;
            case chatCommandMap.playsc:
            case chatCommandMap.psc:
                await this.addToQueue(bot, user, args, true, 'soundcloud'); break;
            case chatCommandMap.playjio:
            case chatCommandMap.pjio:
                await this.addToQueue(bot, user, args, true, 'jiosaavn'); break;
            case chatCommandMap.playtop:
                case chatCommandMap.ptop:
                await this.addToQueueTop(bot, user, args); break;
            case chatCommandMap.now:
                case chatCommandMap.np:
                await this.fetchNowPlaying(bot, user, args); break;
            case chatCommandMap.next:
                await this.fetchUpcomingSong(bot, user, args); break;
            case chatCommandMap.skip:
                await this.skipSong(bot, user, args); break;
            case chatCommandMap.queue:
            case chatCommandMap.q:
                await this.getQueueList(bot, user, args); break;
            case chatCommandMap.playfav:
                await this.playFavourite(bot, user, args); break;
            case chatCommandMap.drop:
            case chatCommandMap.dequeue:
                await this.removeFromQueue(bot, user, args); break;
            case chatCommandMap.undo:
                await this.undoRequest(bot, user, args); break;
            case chatCommandMap.fundo:
                await this.forceUndoRequest(bot, user, args); break;
            default:
                sendWhisper(user.id, "Invalid Command!")
        }
    }

    private async addToQueue(bot: HR, user: User, args: string[], force: boolean | null = false, preference: supportedPlatform | null = null) {
        try {
            if (!args[1]) {
                sendWhisper(user.id, "Enter song name.")
            }
            const songName = args.slice(1).join(" ");
            sendChat(`Adding the song ${songName}`);
            const response = await this.musicRadioApi.addToQueue(songName, user.username, force, preference);
            sendChat(`\n🎵 ${response.message}\n📻 Song Name: ${response.data.title}\n\n🕺 Requested By: @${response.data.requestedBy}`);
        } catch (error: any) {
            logger.error("Error getting queue list", { error });
            sendChat(error?.message ?? "Song Not Found");

        }
    }

    private async addToQueueTop(bot: HR, user: User, args: string[]) {
        try {
            if (!args[1]) {
                sendWhisper(user.id, "Enter song name.")
            }
            const songName = args.slice(1).join(" ");
            sendChat(`Adding the song ${songName}`);
            const response = await this.musicRadioApi.addToQueueTop(songName, user.username);
            sendChat(`\n🎵 ${response.message}\n📻 Song Name: ${response.data.title}\n\n🕺 Requested By: @${response.data.requestedBy}`);
        } catch (error: any) {
            logger.error("Error getting queue list", { error: JSON.stringify(error) })
            sendChat(error.message ?? "Song Not Found");
        }
    }

    private async fetchNowPlaying(bot: HR, user: User, args: string[]) {
        try {
            const response = await this.musicRadioApi.fetchNowPlaying();
            sendChat(`\n╰┈➤ 🎶🎶Now Playing🎶🎶  \n\n🎧 Song Name: 「 ✦ ${response.data.title} ✦ 」\n\n🕣 • ılıılıılıılıılıılı • ${response.data.duration}\n\n\n🧟Requested By: @${response.data.requestedBy}\n\n${getRandomFromArray(musicVibeMessage)}`);
        } catch (error) {
            logger.error("Error getting queue list", { error })
            sendChat("Error getting now playing detail")
        }
    }

    private async fetchUpcomingSong(bot: HR, user: User, args: string[]) {
        try {
            const response = await this.musicRadioApi.fetchUpcoming();
            logger.info("Upcoming song")
            sendChat(`\n╰┈➤ 🎶🎶Upcoming Song🎶🎶  \n\n🎧 Song Name: 「 ✦ ${response.data.title} ✦ 」\n\n🕣 • ılıılıılıılıılıılı • ${response.data.duration}\n\n\n🧟Requested By: @${response.data.requestedBy}\n\n${getRandomFromArray(musicVibeMessage)}`);
        } catch (error) {
            logger.error("Error getting queue list", { error })
            sendChat("Error getting next song detail")
        }
    }
    private async skipSong(bot: HR, user: User, args: string[]) {
        try {
            const response = await this.musicRadioApi.skipSong();
            sendChat(response.message);
            await wait(2000);
            await this.fetchNowPlaying(bot, user, args);
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
                sendChat(`Use "${prefix}queue <page_number>" to view other pages (1-${result.totalPages})`);
            }
        } catch (error) {
            logger.error("Error getting queue list", { error });
            sendChat("Error fetching queue list");
        }
    }

    async removeFromQueue(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const targetIndex = +args[1];
            if (!targetIndex || isNaN(targetIndex)) {
                sendWhisper(user.id, "Enter song index.");
                return;
            }
            if (targetIndex === 1 || targetIndex === 2) {
                sendWhisper(user.id, "Cannot remove the first 2 songs.");
                return;
            }
            const response = await this.musicRadioApi.removeFromQueue(targetIndex);
            sendWhisper(user.id, response.message);
        } catch (error) {
            logger.error("Error remove song from the Queue.")
            sendWhisper(user.id, "Error Removing Queue.")
        }
    }

    async undoRequest(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const response = await this.musicRadioApi.removeLastSongRequestedByUser(user.username);
            sendWhisper(user.id, response.message);
        } catch (error: any) {
            logger.error("Error remove song from the Queue.")
            sendWhisper(user.id, error?.message ?? "Error Removing Queue.")
        }
    }

    async forceUndoRequest(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const username = usernameExtractor(args[1]);
            if (!username) {
                sendWhisper(user.id, "username is requried");
                return;
            }
            const response = await this.musicRadioApi.removeLastSongRequestedByUser(username);
            sendWhisper(user.id, response.message);
        } catch (error) {
            logger.error("Error remove song from the Queue.")
            sendWhisper(user.id, "Error Removing Queue.")
        }
    }

    async playFavourite(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const profile = new UserService();
            const userData = await profile.getUser(user);
            if (!userData) {
                sendWhisper(user.id, "Something is wrong! Please contact the owner");
                return;
            }

            const musicService = new MusicService();
            const userMusicData = await musicService.getMusic(user);
            const userMusicArray = userMusicData.favourite;

            if (userMusicArray.length <= 0) {
                sendWhisper(user.id, "Music Favourite List is empty");
                return;
            }
            let songName = "";
            const songIndex = args[1];

            if (!isNaN(+songIndex)) {
                const index = parseInt(songIndex) - 1;
                if (index < 0 || index >= userMusicArray.length) {
                    sendWhisper(user.id, `Invalid index. Please choose between 1 and ${userMusicArray.length}`);
                    return;
                }
                songName = userMusicArray[index];
            } else {
                songName = userMusicArray[userMusicArray.length - 1];
            }
            if (songName) {
                sendChat(`Adding the song ${songName}`);
                const response = await this.musicRadioApi.addToQueue(songName, user.username);
                sendChat(`\n🎵 ${response.message}\n📻 Song Name: ${response.data.title}\n\n🕺 Requested By: @${response.data.requestedBy}`);
            }
        } catch (error) {

        }
    }
}

export default MusicCommand;
