import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";

class NotImplemented implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        // console.log("Not Implemented")
        return;
    }
}

export default NotImplemented;