import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";

class RateLimit implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        
        return;
    }
}

export default RateLimit;