import HR, { User } from "hr-sdk";
import { MessageCommand } from "../../interface";
import logger from "../../lib/winston";
import { getDebugInfo, isAuthorized, isMessageCommandValid } from "../../utils/utils";
import NotImplemented from "./command-manager/NotImplemented";
import NotAuthorized from "../chat-handler/command-manager/NotAuthorized";
import { messageCommandMap } from "../../utils/constant";
import HelloCommand from "./command-manager/HelloCommand";
import BalanceCommand from "./command-manager/BalanceCommand";
import ProfileCommand from "./command-manager/ProfileCommand";


// Register new Chat command here and add the key in the chatCommandMap.
class MessageCommandFactory {
    private readonly command: { [command: string]: MessageCommand } = {};
    constructor() {
        this.command = {
            [messageCommandMap.hello]: new HelloCommand(),
            [messageCommandMap.balance]: new BalanceCommand(),
            [messageCommandMap.profile]: new ProfileCommand(),
            // [messageCommandMap.plan]: new BotPlanCommand()
            
        }
    }

    async wildcardHandler(_command: string) {
        return new NotImplemented();
    }

    async getCommand(bot: HR, user: User, command: string) {
        if (isMessageCommandValid(command)) {
            logger.info('Valid Message command : ' + command, { debug: getDebugInfo() });
            const isAccessible = await isAuthorized("MESSAGE", command, user, bot);
            if (!isAccessible) {
                logger.info('Not authorized : ' + command, { debug: getDebugInfo() });
                return new NotAuthorized();
            }
            let handler = this.command[command];
            return handler
        }
        return await this.wildcardHandler(command);
    }
}

export default MessageCommandFactory;