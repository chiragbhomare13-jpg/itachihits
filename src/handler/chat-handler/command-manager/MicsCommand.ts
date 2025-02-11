import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { chatCommandMap } from "../../../utils/constant";
import UserService from "../../../service/UserService";
import MusicRadioApi from "../../../api/MusicRadioApi";
import { sendChat, sendWhisper } from "../../../service/bot/botHelper";
import MusicService from "../../../service/MusicService";
import { PaginationUtil } from "../../../utils/paginationUtil";
import { getCommandPrefix } from "../../../utils/utils";

class MiscCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Misc Command executed", { user, args })
        switch (args[0]) {
            case chatCommandMap.pin:
            case chatCommandMap.fav:
                await this.pinFavorite(bot, user, args); break;
            case chatCommandMap.unpin:
            case chatCommandMap.unfav:
                await this.unpinFavourite(bot, user, args); break;
            case chatCommandMap.favlist:
            case chatCommandMap.pinlist:
                await this.getFavouriteList(bot, user, args); break;
        }
    }
    async pinFavorite(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const profile = new UserService();
            const musicApi = new MusicRadioApi();
            const currentSongData = await musicApi.fetchNowPlaying();
            const currentSong = currentSongData.data.title;
            const userData = await profile.getUser(user);
            if (!userData) {
                sendWhisper(user.id, "Something is wrong! Please contact the owner");
                return;
            }
            const musicService = new MusicService();
            const userMusicData = await musicService.getMusic(user);
            const userMusicArray = userMusicData.favourite;
            if (userMusicArray.includes(currentSong)) {
                sendWhisper(user.id, "Music already exists in your favorites.")
                return;
            }
            userMusicArray.push(currentSong);
            await musicService.updateMusic(user, { favourite: userMusicArray });
            sendWhisper(user.id, `Music Added to your Favourite list!\nSong Name: ${currentSong}`);
        } catch (error) {

        }
    }

    async unpinFavourite(bot: HR, user: User, args: string[]): Promise<void> {
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

            let removedSong = "";
            const songIndex = args[1];

            if (!isNaN(+songIndex)) {
                const index = parseInt(songIndex) - 1;
                if (index < 0 || index >= userMusicArray.length) {
                    sendWhisper(user.id, `Invalid index. Please choose between 1 and ${userMusicArray.length}`);
                    return;
                }
                removedSong = userMusicArray.splice(index, 1)[0];
            } else {
                removedSong = userMusicArray.pop() ?? "";
            }

            if (removedSong) {
                await musicService.updateMusic(user, { favourite: userMusicArray });
                sendWhisper(user.id, `Music removed from the Favourite List\nSong Name: ${removedSong}`);
            }

        } catch (error) {
            console.error('Error in unpinFavourite:', error);
            sendWhisper(user.id, "An error occurred while removing the song from favorites");
        }
    }

    async getFavouriteList(bot: HR, user: User, args: string[]): Promise<void> {
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
            const size = 5;
            const page = args[1] ? Math.max(1, parseInt(args[1])) : 1;
            const result = await PaginationUtil.paginateData({
                data: userMusicArray ?? [],
                page,
                itemsPerPage: size,
                formatItem: (songName: string, index: number) =>
                    `\n${index}. ${songName}`
            });
            if (result.isEmpty) {
                sendWhisper(user.id, "Favourite List is Empty");
                return;
            }
            if (result.currentPage > result.totalPages) {
                sendWhisper(user.id, `Invalid page number. Total Pages available: ${result.totalPages}`);
                return;
            }
            sendWhisper(user.id, `Queue List (page ${result.currentPage}/${result.totalPages})`);
            result.messages.forEach(message => sendWhisper(user.id, `\n${message}`));
            if (result.totalPages > 1) {
                const prefix = await getCommandPrefix();
                sendWhisper(user.id, `Use "${prefix}favlist <page_number>" to view other pages (1-${result.totalPages})`);
            }
        } catch (error) {
            logger.error("Error getting favourite list", { error })
            sendWhisper(user.id, "Error getting favourite list")
        }
    }
}

export default MiscCommand;