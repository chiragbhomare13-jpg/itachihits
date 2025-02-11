import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import { sendWhisper } from "../../../service/bot/botHelper";

class RateLimit implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        sendWhisper(user.id, "Rate Limit Exceeded! You can only use 3 commands per 30 seconds. Please wait a moment before trying again.");
        return;
    }
}

export default RateLimit;
