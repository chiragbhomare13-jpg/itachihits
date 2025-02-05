import HR, { MessageEvent, User } from "hr-sdk";
import { MessageCommand } from "../../../interface";
import logger from "../../../lib/winston";
import UserService from "../../../service/UserService";
import { SendDirectMessageByUserId } from "../../../service/bot/botHelper";


class ProfileCommand implements MessageCommand {
    async execute(bot: HR, user: User, args: string[], conversation: MessageEvent): Promise<void> {
        logger.info("Profile Message Command executed", { user, args })
        if (args[0] === "profile") {
            await this.profile(bot, user, args);
        }
    }
    async profile(bot: HR, user: User, args: string[]): Promise<void> {
        const userService = new UserService();
        const userData = await userService.getUser(user);
        // const musicData = await musicService.getMusic(user);
        if (!userData) {
            SendDirectMessageByUserId(user.id, "Something went wrong! Please try again");
            return;
        }
        const name = `Username: ${userData.username}`;
        const balance = `Balance: ${userData.wallet}`;
        const permission = `Role: ${userData.permission}`;


        SendDirectMessageByUserId(user.id, `${name}\n${balance}\n${permission}`)
    }
}

export default ProfileCommand;