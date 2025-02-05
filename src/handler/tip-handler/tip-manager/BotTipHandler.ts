import { TipEvent, User } from "hr-sdk";
import logger from "../../../lib/winston";
import { SendDirectMessageByUserId } from "../../../service/bot/botHelper";
import UserService from "../../../service/UserService";

class BotTipHandler {
    private readonly type: string;
    private readonly amount: number;
    private readonly senderId: string;
    private readonly senderName: string;
    private readonly user: User;
    constructor(data: TipEvent) {
        logger.info("Bot Tip Handler is executing", { data })
        this.type = typeof data.item.type == 'string' ? data.item.type : '';
        this.amount = data.item.amount;
        this.senderId = data.sender.id;
        this.senderName = data.sender.username;
        this.user = { username: data.sender.username, id: data.sender.id }
    }
    async botTipHandler() {
        if (!this.type || this.amount <= 0) {
            logger.warn("Tip Type is not specified", { type: this.type, amount: this.amount })
            return;
        }
        await this.addBalance();
    }

    async addBalance() {
        try {
            const userService = new UserService();
            const newBal = await userService.updateBalanceByUserId(this.user, this.amount, 'deposit');
            SendDirectMessageByUserId(this.senderId, `Gold ${this.amount} credited to your account \n Total Balance ${newBal}.`)
        } catch (error: any) {
            SendDirectMessageByUserId(this.senderId, error.message);
        }
    }
}

export default BotTipHandler;