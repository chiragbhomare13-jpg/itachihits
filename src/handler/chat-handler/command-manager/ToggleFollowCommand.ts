import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import { getUserPosition, isPosition, usernameExtractor } from "../../../utils/utils";
import cache from "../../../utils/cache";
import { cacheKey, chatCommandMap } from "../../../utils/constant";

class ToggleFollowCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            switch (args[0]) {
                case chatCommandMap.follow:
                    await this.handleFollowCommand(bot, user, args);
                    break;
                case chatCommandMap.unfollow:
                    this.handleUnfollowCommand();
                    break;
            }
        } catch (error) {
            console.log(error)
        }
    }

    private async handleFollowCommand(bot: HR, user: User, args: string[]) {
        const username = usernameExtractor(args[1]);
        let userId = user.id;
        try {
            if (username) {
                const userDetail = await bot.action.getRoomUserByUsername(username);
                const user_id = userDetail[0].id;
                userId = user_id;
            }
            if (!cache.has(cacheKey.follow)) {
                const position = await getUserPosition(bot, userId);
                if (isPosition(position)) {
                    bot.action.walk(position);
                }
                cache.set(cacheKey.follow, userId);
            }
        } catch (error) {
            console.log(error)
        }
    }

    private async handleUnfollowCommand() {
        cache.remove(cacheKey.follow);
    }
}

export default ToggleFollowCommand;

