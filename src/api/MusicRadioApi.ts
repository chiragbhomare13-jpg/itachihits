import axios, { AxiosInstance } from "axios";
import serverConfig from "../config/server-config";
import logger from "../lib/winston";

class MusicRadioApi {
    private readonly baseUrl = serverConfig.MUSIC_BOT_BASE_API;
    private readonly apiInstance: AxiosInstance;
    private readonly adminApiInstance: AxiosInstance;

    constructor() {
        this.apiInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'x-token-key': serverConfig.X_TOKEN_KEY
            }
        });

        this.adminApiInstance = axios.create({
            baseURL: `${this.baseUrl}/admin`,
            headers: {
                'x-admin-token-key': serverConfig.X_ADMIN_TOKEN_KEY,
                'x-admin-api-key': serverConfig.X_ADMIN_API_KEY
            }
        });
    }

    async generateNewToken() {
        try {
            const response = await this.adminApiInstance.post('/admin/token');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to generate new token", { error: error.response?.data || error.message });
            throw new Error("Failed to generate new token");
        }
    }
    // Regular API methods with proper error handling
    async fetchQueue() {
        try {
            const response = await this.apiInstance.get('/songs/queue');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to fetch queue", { error: error.response?.data || error.message });
            throw new Error("Failed to fetch queue");
        }
    }

    async fetchNowPlaying() {
        try {
            const response = await this.apiInstance.get('/songs/current');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to fetch current song", { error: error.response?.data || error.message });
            throw new Error("Failed to fetch current song");
        }
    }

    async fetchUpcoming() {
        try {
            const response = await this.apiInstance.get('/songs/upcoming');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to fetch upcoming song", { error: error.response?.data || error.message });
            throw new Error("Failed to fetch upcoming song");
        }
    }

    async skipSong() {
        try {
            const response = await this.apiInstance.get('/songs/skip');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to skip song", { error: error.response?.data || error.message });
            throw new Error("Failed to skip song");
        }
    }

    async addToQueue(songName: string, requestedBy: string) {
        try {
            const response = await this.apiInstance.post('/songs/add', { songName, requestedBy });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add song to queue", { error: error.response?.data || error.message });
            throw new Error("Failed to add song to queue");
        }
    }
}

export default MusicRadioApi;
