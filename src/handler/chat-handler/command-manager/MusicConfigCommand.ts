import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";

class MusicConfigCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Music Config Command executed", { user, args })
    }
}

export default MusicConfigCommand;