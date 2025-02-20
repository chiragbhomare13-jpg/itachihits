import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";

class DefaultPlaylistCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Default Playlist Command executed", { user, args })
    }
}

export default DefaultPlaylistCommand;