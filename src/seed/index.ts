import ConfigService from "../service/CommonConfigService";
import MessageStoreService from "../service/MessageStoreService";
import logger from "../lib/winston";
import SchedulerConfigService from "../service/SchedulerConfigService";

// Load the initial data to the database for the first startup.a
async function init() {
    await defaultConfigInit();
    await defaultMessageStoreInit();
    await defaultSchedulerInit();
}

async function defaultConfigInit() {
    try {
        const configService = new ConfigService();
        await configService.initializeConfig();
    } catch (error) {
        logger.error("Failed to initialize Config", { error })
    }
}

async function defaultMessageStoreInit() {
    try {
        const messageStore = new MessageStoreService();
        const resposne = await messageStore.initialMessageStoreSetup();
        if (resposne) {
            logger.info("Successfully created message store");
        }
    } catch (error) {
        logger.error("Failed to initialize message store", { error })
    }
}

async function defaultSchedulerInit() {
    try {
        const scheduler = new SchedulerConfigService();
        const response = await scheduler.initialSchedulerConfigSetup();
        if (response.length > 0) {
            logger.info("Successfully Created Scheduler Configuration")
        }
    } catch (error) {
        logger.error("Failed to initialize Scheduler Configuration", { error })
    }
}

export default init;