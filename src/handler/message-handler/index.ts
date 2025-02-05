import HR, { MessageEvent, MessageType as MessageTypeHr, User } from "hr-sdk";
import logger from "../../lib/winston";
import MessageCommandFactory from "./MessageCommandFactory";
import hrCache from "../../utils/cache";
import { getLastUserMessage, getMessageToArgs } from "../../utils/utils";
import UserService from "../../service/UserService";
import InteractionManager from "../../service/bot/MessageInteractionManager";
import { sendDirectMessage } from "../../service/bot/botHelper";

class MessageHandler {
    private readonly messageCommandFactory: MessageCommandFactory;
    private readonly userService: UserService;
    private readonly interactionManager: InteractionManager;
    constructor(private readonly bot: HR, private readonly data: MessageEvent) {
        this.messageCommandFactory = new MessageCommandFactory();
        this.userService = new UserService();
        this.interactionManager = new InteractionManager();
        this.onMessage();
    }

    async onMessage() {
        if (hrCache.get('botId') === this.data.userId) return;
        const message = await getLastUserMessage(this.bot, this.data.conversationId, this.data.userId);
        if (!message) return;
        const args = getMessageToArgs(message);
        if (args == null || args.length === 0) return;
        try {
            const commandName = args[0].toLowerCase();
            args[0] = commandName;
            // Fetch username from db if not exist fetch it from highrise webapi.
            const user: User = { id: this.data.userId, username: "" };
            const userData = await this.userService.getUser(user, this.bot);
            if (!userData) {
                this.bot.action.sendMessageToUser({ type: MessageTypeHr.text, content: "Network problem! Try again after some time! or contact the owner", conversationId: this.data.conversationId });
                return;
            }
            logger.info("coming here")
            user.username = userData.username;
            if (this.interactionManager.isUserInteractionExist(user, 'message')) {
                logger.info(`User ${user.username} is interacting with bot. Ignoring command ${args[0]}`)
                const msg = await this.interactionManager.processMessage({ content: message, messageType: 'message', userId: user.id })
                if (msg?.message) {
                    sendDirectMessage(this.data.conversationId, msg.message)
                }
            }
            logger.info("coming here")
            const handler = await this.messageCommandFactory.getCommand(this.bot, user, commandName);
            if (!handler?.execute) return;
            handler.execute(this.bot, user, args, this.data);
        } catch (error) { 
            logger.error("Error Executing Message Command: " + args[0], { error, args, userId: this.data.userId })
            console.log("Error Executing Messsage Command");
        }
    }

}
export default MessageHandler