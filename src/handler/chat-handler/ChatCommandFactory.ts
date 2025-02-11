import { ChatCommand } from "../../interface";
import logger from "../../lib/winston";
import { chatCommandMap } from "../../utils/constant";
import { getDebugInfo, isAuthorized, isCommandValid } from "../../utils/utils";
import HelloCommand from "./command-manager/HelloCommand";
import NotImplemented from "./command-manager/NotImplemented";

import ToggleFollowCommand from "./command-manager/ToggleFollowCommand";

import HR, { User } from "hr-sdk";
import NotAuthorized from "./command-manager/NotAuthorized";
import PermissionManagerCommand from "./command-manager/PermissionManagerCommand";
import MusicCommand from "./command-manager/MusicCommand";
import ReloateCommand from "./command-manager/RelocateCommand";
import SetCommand from "./command-manager/SetCommand";
import MiscCommand from "./command-manager/MicsCommand";
import RateLimit from "./command-manager/RateLimit";
import RateLimiter from "../../utils/RateLimiter";

// Register new Chat command here and add the key in the chatCommandMap.
class ChatCommandFactory {
    private readonly command: { [command: string]: ChatCommand } = {};
    constructor() {
        this.command = {
            [chatCommandMap.hello]: new HelloCommand(),

            [chatCommandMap.follow]: new ToggleFollowCommand(),
            [chatCommandMap.unfollow]: new ToggleFollowCommand(),

            [chatCommandMap.add]: new PermissionManagerCommand(),
            [chatCommandMap.unadd]: new PermissionManagerCommand(),
            [chatCommandMap.allow]: new PermissionManagerCommand(),
            [chatCommandMap.unallow]: new PermissionManagerCommand(),
            [chatCommandMap.enable]: new PermissionManagerCommand(),
            [chatCommandMap.disable]: new PermissionManagerCommand(),

            [chatCommandMap.play]: new MusicCommand(),
            [chatCommandMap.playfav]: new MusicCommand(),
            [chatCommandMap.now]: new MusicCommand(),
            [chatCommandMap.next]: new MusicCommand(),
            [chatCommandMap.queue]: new MusicCommand(),
            [chatCommandMap.skip]: new MusicCommand(),

            [chatCommandMap.relocate]: new ReloateCommand(),
            [chatCommandMap.set]: new SetCommand(),

            [chatCommandMap.pin]: new MiscCommand(),
            [chatCommandMap.fav]: new MiscCommand(),
            [chatCommandMap.unpin]: new MiscCommand(),
            [chatCommandMap.unfav]: new MiscCommand(),
            [chatCommandMap.favlist]: new MiscCommand(),
            [chatCommandMap.pinlist]: new MiscCommand(),
        }
    }

    async wildcardHandler(_command: string) {
        return new NotImplemented();
    }

    async getCommand(bot: HR, user: User, command: string) {
        if (isCommandValid(command)) {
            logger.info('Valid command came: ' + command, { debug: getDebugInfo() });
            
            // Check rate limit first
            const rateLimiter = RateLimiter.getInstance();
            if (!rateLimiter.isAllowed(user.id, command)) {
                return new RateLimit();
            }

            const isAccessible = await isAuthorized("CHAT", command, user, bot);
            if (!isAccessible) {
                return new NotAuthorized();
            }
            
            let handler = this.command[command];
            return handler;
        }
        return await this.wildcardHandler(command);
    }
}

export default ChatCommandFactory;
