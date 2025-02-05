import HR, { MessageEvent, User } from "hr-sdk";
import { MessageCommand } from "../../../interface";
import logger from "../../../lib/winston";
import UserService from "../../../service/UserService";
import { SendDirectMessageByUserId } from "../../../service/bot/botHelper";
import MusicService from "../../../service/MusicService";


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
        const musicService = new MusicService();
        const musicData = await musicService.getMusic(user);
        if (!userData || !musicData) {
            SendDirectMessageByUserId(user.id, "Something went wrong! Please try again");
            return;
        }
        const name = `✌️<#9ACBD0>Username: ${userData.username}`;
        const balance = `💳 <#9EDF9C>Balance: ${userData.wallet}`;
        const permission = `🤖 <#D8DBBD>Role: ${userData.permission}`;
        const slots = `🎰 <#FFE31A>Music Slots Remaining: ${musicData.slots}`
        const moreMusicDetail = `To check more fav list - favlist`

        SendDirectMessageByUserId(user.id, `${name}\n${balance}\n${permission}\n${slots}\n\n${moreMusicDetail}`)
    }
}

export default ProfileCommand;