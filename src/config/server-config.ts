import dotenv from 'dotenv';
import CommonConfigService from '../service/CommonConfigService';
import logger from '../lib/winston';
import hrCache from '../utils/cache';
import { cacheKey } from '../utils/constant';
dotenv.config();

export default {
    HIGHRISE_TOKEN: process.env.HIGHRISE_TOKEN ?? "",
    NODE_ENV: process.env.NODE_ENV ?? "development",
    ROOM_ID: process.env.ROOM_ID ?? "",
    LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
    MUSIC_BOT_BASE_API: process.env.MUSIC_BOT_BASE_API ?? "http://localhost:9126/api",
    X_ADMIN_API_KEY: process.env.X_ADMIN_API_KEY ?? "",
    X_ADMIN_TOKEN_KEY: process.env.X_ADMIN_TOKEN_KEY ?? "",
    X_TOKEN_KEY: process.env.X_TOKEN_KEY ?? "",
    COMMAND_PREFIX: process.env.COMMAND_PREFIX ?? "-",
}

export const requiredEnvFields = ['HIGHRISE_TOKEN', 'MUSIC_BOT_BASE_API', 'ROOM_ID', 'X_TOKEN_KEY']
export const envValidation = () => {
    const missingFields = requiredEnvFields.filter(field => !process.env[field] || process.env[field]?.trim() === '')
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required environment variables: ${missingFields.join(', ')}`)
    }
}

export const getRoomId = async (): Promise<string> => {
    const commonConfigService = new CommonConfigService();
    let roomId = await commonConfigService.getActiveRoomId();
    hrCache.set(cacheKey.roomId, roomId);
    if (!roomId) {
        roomId = process.env.ROOM_ID ?? "";
    }
    return roomId;
}

export async function asyncServerConfig() {
    try {
        return {
            ROOM_ID: await getRoomId(),
        }
    } catch (error) {
        logger.error("Error in asyncServerConfig", { error });
        throw error;
    }
}
