import { User } from "hr-sdk";
import MusicRepository from "../repositories/MusicRepository";
import UserService from "./UserService";
import logger from "../lib/winston";
import { Music } from "../interface/models";

class MusicService {
    private readonly musicRepo: MusicRepository;
    constructor() {
        this.musicRepo = new MusicRepository();
    }

    public async getMusic(user: User) {
        try {
            let musicData;
            const userService = new UserService();
            const userData = await userService.getUser(user);
            if (!userData) {
                throw new Error("User not found.");
            }
            const userId = userData.userId;
            musicData = await this.musicRepo.findOne({ userId: userId });
            if (!musicData) {
                musicData = await this.createDefaultMusic(user);
                if (!musicData) {
                    throw new Error("Music not found");
                }
            }
            return musicData;
        } catch (error) {
            logger.error("Error Getting Music Data", { error })
            throw new Error("Error Getting Music Data")
        }
    }

    private async createDefaultMusic(user: User): Promise<Music | null> {
        try {
            const musicData = await this.musicRepo.create({
                id: user.id,
                userId: user.id,
                favourite: [],
                slots: 5
            });
            return musicData;
        } catch (error) {
            logger.error("Error creating default music", { error });
            throw new Error("Error creating Default Music");
        }
    }

    async updateMusic(user: User, payload: Partial<Music>): Promise<Music | null> {
        try {
            const musicData = await this.getMusic(user);
            if (!musicData) {
                throw new Error("Music not found.");
            }
            const newMusicData = await this.musicRepo.update(musicData.id, payload);
            return newMusicData;
        } catch (error) {
            logger.error("Error Updating Music Data", { error });
            throw new Error("Error Updating Music Data");
        }
    }
}

export default MusicService;