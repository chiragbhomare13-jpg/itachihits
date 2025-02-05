import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { sendChat, sendWhisper } from "../../../service/bot/botHelper";
import CommonConfigService from "../../../service/CommonConfigService";

class SetCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Set Command executed", { user, args })
        if (args[1] === "prefix") {
            await this.setPrefix(bot, user, args);
        }
        switch (args[1]) {
            case "prefix":
                await this.setStartingPoint(bot, user, args);
                break;
            case "outfit":
                await this.setBotOutift(bot, user, args);
                break;
            case "start":
                await this.setStartingPoint(bot, user, args);
                break;
        }
    }

    async setPrefix(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Set prefix executed", { user, args })
        const prefix = args[2];
        if (prefix.length > 1) {
            sendWhisper(user.id, "prefix length should be one. eg. !, -, $");
            return;
        }
        try {
            const commonConfig = new CommonConfigService();
            const res = await commonConfig.setCommandPrefix(prefix);
            if (res) {
                sendWhisper(user.id, `Prefix set to ${prefix}`);
            } else {
                sendWhisper(user.id, "Failed to set prefix");
            }
        } catch (error) {
            logger.error("Error setting prefix", { error });
            sendWhisper(user.id, "Failed to set prefix");
        }
    }

    async setStartingPoint(bot: HR, user: User, args: string[]): Promise<void> {
        sendChat("Comming Soon...")
    }

    async setBotOutift(bot: HR, user: User, args: string[]): Promise<void> {
        sendChat("Cooming Soon...")
    }
}

export default SetCommand;