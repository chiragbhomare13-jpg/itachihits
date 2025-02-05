import { getCommandPrefix, getMessageToArgs } from "../../utils/utils";
import CommandFactory from "./ChatCommandFactory";
import HR, { ChatEvent } from "hr-sdk";
import hRCache from "../../utils/cache";
import logger from "../../lib/winston";
import MessageStoreService from "../../service/MessageStoreService";
import serverConfig from "../../config/server-config";

class ChatHandler {
    private readonly commandFactory: CommandFactory;
    constructor(private readonly bot: HR, private readonly data: ChatEvent) {
        this.commandFactory = new CommandFactory();
        this.onChat();
    }

    async onChat() {
        if (hRCache.get('botId') === this.data.user.id) {
            return;
        }
        // Split into arguments.
        const args = getMessageToArgs(this.data.message);
        const prefix = await getCommandPrefix();
        if (args == null || args.length === 0 || !args[0].startsWith(prefix)) {
            return;
        }
        try {
            const commandName = args[0].toLowerCase().slice(1);
            args[0] = commandName;
            const handler = await this.commandFactory.getCommand(this.bot, this.data.user, commandName);
            if (!handler?.execute) return;
            handler.execute(this.bot, this.data.user, args);
            this.messageTrigger(args);
        } catch (error) {
            logger.error("Error Executing Command: " + args[0], { error, args, user: JSON.stringify(this.data.user) })
            console.log("Error Executing Command");
        }
    }

    private async messageTrigger(message: string[]) {
        const messageStoreService = new MessageStoreService();
        const messageResponse = await messageStoreService.getTriggerMessage(message);
        if (messageResponse) {
            this.bot.action.broadcastMessage(messageResponse);
        }
    }
}

export default ChatHandler;