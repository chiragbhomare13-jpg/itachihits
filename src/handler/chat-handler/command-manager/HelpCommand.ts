import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import { SendDirectMessageByUserId } from "../../../service/bot/botHelper";
import { generateCategorizedHelpMessage, generateCommandHelpMessage } from "../../../utils/utils";


class HelpCommand implements ChatCommand {
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            // Parse arguments
            if (args.length > 1) {
                const firstArg = args[1].toLowerCase();
                
                // Check if it's a category request: help cat <category> [page]
                if (firstArg === 'cat' && args.length > 2) {
                    const category = args[2].toLowerCase();
                    const page = args.length > 3 ? parseInt(args[3]) || 1 : 1;
                    
                    const helpMessage = await generateCategorizedHelpMessage(user, bot, "CHAT", category, page);
                    await SendDirectMessageByUserId(user.id, helpMessage);
                    return;
                }
                
                // Check if it's "help all" to show all commands
                if (firstArg === 'all') {
                    const page = args.length > 2 ? parseInt(args[2]) || 1 : 1;
                    const helpMessage = await generateCategorizedHelpMessage(user, bot, "CHAT", 'all', page);
                    await SendDirectMessageByUserId(user.id, helpMessage);
                    return;
                }
                
                // Otherwise, treat it as a specific command help request
                const commandName = firstArg;
                const helpMessage = await generateCommandHelpMessage(commandName, user, bot, "CHAT");
                console.log("command help message", helpMessage);
                await SendDirectMessageByUserId(user.id, helpMessage);
            } else {
                // Show categorized overview
                const helpMessage = await generateCategorizedHelpMessage(user, bot, "CHAT");
                await SendDirectMessageByUserId(user.id, helpMessage);
            }
        } catch (error) {
            console.error("Error in HelpCommand:", error);
            await SendDirectMessageByUserId(user.id, "Sorry, I couldn't process your help request at this time.");
        }
    }
}

export default HelpCommand
