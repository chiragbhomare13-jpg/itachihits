import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";

class MiscCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Misc Command executed", { user, args })
    }

    async buyMusicSlot(){
        // code to buy music slot
    }
   
}

export default MiscCommand;