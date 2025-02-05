import HR, { MessageEvent, MessageType, User } from "hr-sdk";
import { MessageCommand } from "../../../interface";
import logger from "../../../lib/winston";
import InteractionManager from "../../../service/bot/MessageInteractionManager";
import { sendDirectMessage } from "../../../service/bot/botHelper";

class HelloCommand implements MessageCommand {
    async execute(bot: HR, user: User, args: string[], conversation: MessageEvent): Promise<void> {
        logger.info("Hello Command executed", { user, args })
        bot.action.sendMessageToUser({ content: "Radhe Radhe", conversationId: conversation.conversationId, type: MessageType.text })
        const im = new InteractionManager();
        const message = await im.processMessage({ content: "settrigger", messageType: 'message', userId: user.id });
        if (message?.message) {
            sendDirectMessage(conversation.conversationId, message.message);
        }
    }
}

export default HelloCommand;