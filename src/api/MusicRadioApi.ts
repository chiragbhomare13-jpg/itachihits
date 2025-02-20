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
            throw new Error(error?.response?.data.message ?? "Failed to generate new token");
        }
    }

    // Regular API methods with proper error handling
    async fetchQueue() {
        try {
            const response = await this.apiInstance.get('/songs/queue');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to fetch queue", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to fetch queue");
        }
    }

    async fetchNowPlaying() {
        try {
            const response = await this.apiInstance.get('/songs/current');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to fetch current song", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to fetch current song");
        }
    }

    async fetchUpcoming() {
        try {
            const response = await this.apiInstance.get('/songs/upcoming');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to fetch upcoming song", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to fetch upcoming song");
        }
    }

    async skipSong() {
        try {
            const response = await this.apiInstance.get('/songs/skip');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to skip song", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to skip song");
        }
    }

    async previous() {
        try {
            const response = await this.apiInstance.get('/songs/previous');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to play previous song", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to play previous song");
        }
    }

    async addToQueue(songName: string, requestedBy: string, force: boolean | null = false, preference: string | null = null) {
        try {
            const response = await this.apiInstance.post('/songs/add', { songName, requestedBy, force, preference });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add song to queue", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to add song to queue");
        }
    }

    async addToQueueTop(songName: string, requestedBy: string) {
        try {
            const response = await this.apiInstance.post('/songs/add/top', { songName, requestedBy });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add song to queue", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to add song to queue");
        }
    }

    async removeFromQueue(songIndex: number) {
        try {
            const response = await this.apiInstance.delete(`/songs/remove/${songIndex}`);
            return response.data;
        } catch (error: any) {
            logger.error("Failed to remove song from queue", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to remove song from queue");
        }
    }

    async removeLastSongRequestedByUser(username: string) {
        try {
            const response = await this.apiInstance.delete(`/songs/requests/last/${username}`);
            return response.data;
        } catch (error: any) {
            logger.error("Failed to remove last song requested by user", { error: error.response?.data || error.response.message });
            throw new Error(error?.response?.data.message ?? "Failed to remove last song requested by user");
        }
    }

    /**
     * ====================================
     * Block Related API Methods
     * ====================================
    */
    async blockCurrentSong(requestedBy: string) {
        try {
            const response = await this.apiInstance.post('/songs/block/current', { requestedBy });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add song to queue", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to add song to queue");
        }
    }

    async blockSongByName(songName: string, requestedBy: string) {
        try {
            const response = await this.apiInstance.post('/songs/block', { songName, requestedBy });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add song to queue", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to add song to queue");
        }
    }

    async unblockSongBySongName(songName: string) {
        try {
            const response = await this.apiInstance.delete(`/songs/block/${songName}`);
            return response.data;
        } catch (error: any) {
            logger.error("Failed to unblock the song.", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to unblock the song.");
        }
    }

    async deleteAllBlockList() {
        try {
            const response = await this.apiInstance.delete('/songs/block/all');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to clear all block list.", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to clear all block list.");
        }
    }
    
    async unblockBlockListByIndex(indexNumber: number) {
        try {
            const response = await this.apiInstance.delete(`/songs/block/${indexNumber}`);
            return response.data;
        } catch (error: any) {
            logger.error("Failed to unblock the song by Number", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to unblock the song by Number");
        }
    }

    async getAllBlockList() {
        try {
            const response = await this.apiInstance.get('/songs/block/list');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to fetch All Block list", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to get All Block list.");
        }
    }

    async isSongBlocked() {
        try {
            const response = await this.apiInstance.get('/songs/block/check');
            return response.data;
        } catch (error: any) {
            logger.error("Failed to check song block list.", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.message ?? "Failed to check song block list.");
        }
    }

    /**
    * ======================================
    * Playlist Adding To Queue API Methods
    * ======================================
   */
    async addPlaylistToQueue(songName: string, requestedBy: string, source: string) {
        try {
            const response = await this.apiInstance.post('/playlist/add', { songName, requestedBy, source });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add Playlist to queue", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to add Playlist to queue");
        }
    }

    async addPlaylistToTop(songName: string, requestedBy: string, source: string) {
        try {
            const response = await this.apiInstance.post('/playlist/add/top', { songName, requestedBy, source });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add Playlist to top", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to add Playlist to top");
        }
    }

    /**
     * ==================================================
     * API Related to the Default Playlist
     * ==================================================
     */
    async addDefaultPlaylist(playlistId: string, title: string, source: string, requestedBy: string) {
        try {
            const response = await this.apiInstance.post('/playlist/default', { playlistId, title, source, requestedBy });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add Default Playlist", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to add Default Playlist");
        }
    }

    async removeDefaultPlaylist(index: number) {
        try {
            const response = await this.apiInstance.delete(`/playlist/default/${index}`);
            return response.data;
        } catch (error: any) {
            logger.error("Failed to add Default Playlist", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to add Default Playlist");
        }
    }

    async getDefaultPlaylist() {
        try {
            const response = await this.apiInstance.get(`/playlist/default`);
            return response.data;
        } catch (error: any) {
            logger.error("Failed to Get Default Playlist", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to Get Default Playlist");
        }
    }

    async getDefaultPlaylistStatus(index: number, isActive: boolean) {
        try {
            const response = await this.apiInstance.put(`/playlist/default/${index}/status`, { isActive });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to Get Default Playlist", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to Get Default Playlist");
        }
    }

    /**
    * ==================================================
    * API Related to the Configuration
    * ==================================================
    */
    async getConfig() {
        try {
            const response = await this.apiInstance.get(`/config`);
            return response.data;
        } catch (error: any) {
            logger.error("Failed to Get Config", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to Get Config");
        }
    }

    async updateConfig(key: string, value: string) {
        try {
            const response = await this.apiInstance.post(`/config`, { key, value });
            return response.data;
        } catch (error: any) {
            logger.error("Failed to Update Config", { error: error.response?.data || error.message });
            throw new Error(error?.response?.data.error.message ?? error?.response?.data.message ?? "Failed to Update Config");
        }
    }
}

export default MusicRadioApi;
