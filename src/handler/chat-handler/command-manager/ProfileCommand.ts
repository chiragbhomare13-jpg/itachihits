import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";

class ProfileCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Profile Command executed", { user, args })
        // switch(args[0]){}
    }
}

export default ProfileCommand;