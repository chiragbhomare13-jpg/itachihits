import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";

class NotAuthorized implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.warn("Not Authorized to execute the command", { user, args })
    }
}

export default NotAuthorized;