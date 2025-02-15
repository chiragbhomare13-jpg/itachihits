import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import { sendWhisper } from "../../../service/bot/botHelper";
import { RATE_LIMIT_MAX_REQUEST, RATE_LIMIT_TIME_WINDOW } from "../../../utils/constant";

class RateLimit implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        sendWhisper(user.id, `Rate Limit Exceeded! You can only use ${RATE_LIMIT_MAX_REQUEST} commands per ${RATE_LIMIT_TIME_WINDOW} seconds. Please wait a moment before trying again.`);
        return;
    }
}

export default RateLimit;
