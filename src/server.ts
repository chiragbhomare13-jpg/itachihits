import bot from './bot';
import serverConfig, { asyncServerConfig, envValidation } from './config/server-config';
import logger from './lib/winston';
import init from './seed';

process.on('uncaughtException', (error) => {
    console.error('Unhandled Exception:', error);
    logger.error('Uncaught Exception:', error);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startBot() {
    try {
        envValidation()
        const { ROOM_ID } = await asyncServerConfig();
        bot.connect(serverConfig.HIGHRISE_TOKEN, ROOM_ID, async () => {
            console.log(`Connect to the highrise Server`);
            await init();
        });
    } catch (error: any) {
        console.error("Error connecting to the bot:", error);
        console.error("Error Message: ", error?.message);
        process.exit(1);
    }
}

startBot();
