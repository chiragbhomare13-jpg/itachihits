import HR, { MessageEvent, User } from "hr-sdk";
import { MessageCommand } from "../../../interface";
import logger from "../../../lib/winston";
import InteractionManager from "../../../service/bot/MessageInteractionManager";
import { sendDirectMessage, SendDirectMessageByUserId } from "../../../service/bot/botHelper";
import UserService from "../../../service/UserService";
import { messageCommandMap } from "../../../utils/constant";

class BalanceCommand implements MessageCommand {
    async execute(bot: HR, user: User, args: string[], conversation: MessageEvent): Promise<void> {
        logger.info("Balance Message Command executed", { user, args })

        // const im = new InteractionManager();
        // const message = await im.processMessage({ content: "settrigger", messageType: 'message', userId: user.id });
        // if (message?.message) {
        //     sendDirectMessage(conversation.conversationId, message.message);
        // }
        if(args[0] === messageCommandMap.balance){
            await this.checkBalance(bot, user, args);
        }
    }

    async checkBalance(bot: HR, user: User, args: string[]): Promise<void> {
        const userService = new UserService();
        const userData = await userService.getUser(user);
        if (userData) {
            SendDirectMessageByUserId(user.id, `Your current balance is ${userData.wallet} Gold`);
        } else {
            SendDirectMessageByUserId(user.id, "User not found");
        }
    }
}

export default BalanceCommand;