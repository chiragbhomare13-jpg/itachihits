import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { sendChat } from "../../../service/bot/botHelper";

class HelloCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Hello Command executed", { user, args })
        sendChat("Radhe Radhe")
    }
}

export default HelloCommand;