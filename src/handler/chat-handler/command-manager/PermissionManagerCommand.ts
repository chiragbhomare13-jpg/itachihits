import HR, { User } from "hr-sdk";
import { ChatCommand } from "../../../interface";
import logger from "../../../lib/winston";
import { hasAssignPermission, isValidBasePermission, isValidCommand, isValidRole, usernameExtractor } from "../../../utils/utils";
import { sendWhisper } from "../../../service/bot/botHelper";
import UserService from "../../../service/UserService";
import { Command, Permission } from "../../../interface/models";
import { chatCommandMap } from "../../../utils/constant";
import CommandConfigService from "../../../service/CommandConfigService";
/**
 * @description To Add The Permission to Use the particular bot command.
 */
class PermissionManagerCommand implements ChatCommand {
    private readonly commandConfigService: CommandConfigService;
    private readonly userService: UserService;
    constructor() {
        this.userService = new UserService();
        this.commandConfigService = new CommandConfigService();
    }
    async execute(bot: HR, user: User, args: string[]): Promise<void> {
        logger.info("Add Command executed", { user, args });
        switch (args[0]) {
            case chatCommandMap.add:
                this.addPermission(bot, user, args);
                break;
            case chatCommandMap.unadd:
                this.unaddPermission(bot, user, args);
                break;;
            case chatCommandMap.allow:
                this.allowCommand(bot, user, args);
                break;
            case chatCommandMap.unallow:
                this.unallowCommand(bot, user, args);
                break;
            case chatCommandMap.enable:
                this.enableCommand(bot, user, args);
                break;
            case chatCommandMap.disable:
                this.disableCommand(bot, user, args);
                break;
            default:
                sendWhisper(user.id, "Invalid Command");
        }
    }

    private async addPermission(bot: HR, user: User, args: string[]): Promise<void> {
        const roleName = args[1]
        const target = args[2];
        const username = usernameExtractor(target);
        if (!target || target.trim() === "" || !username) {
            sendWhisper(user.id, "Enter valid Username - add permission username");
            return;
        }
        if (!isValidRole(roleName)) {
            sendWhisper(user.id, "Enter valid role name - add permission username");
            return;
        }
        const hasPermissionToAssign = await hasAssignPermission('CHAT', roleName, user, bot);
        if (!hasAssignPermission) {
            sendWhisper(user.id, "You must have permission to assign this role");
        }
        console.log(hasPermissionToAssign, "hasAssign Permission");

        const { message } = await this.userService.addPermission(username, roleName as Permission);
        sendWhisper(user.id, message);
    }

    private async unaddPermission(bot: HR, user: User, args: string[]): Promise<void> {
        const roleName = args[1]
        const target = args[2];
        const username = usernameExtractor(target);
        if (!target || target.trim() === "" || !username) {
            sendWhisper(user.id, "Enter valid Username");
            return;
        }
        if (!isValidRole(roleName)) {
            sendWhisper(user.id, "Enter valid role name");
            return;
        }
        const hasPermissionToUpdate = await hasAssignPermission('CHAT', roleName, user, bot);
        if (!hasAssignPermission) {
            sendWhisper(user.id, "You must have permission to remove this role");
        }
        console.log(hasPermissionToUpdate, "hasPermissionToUpdate Permission");

        const { message } = await this.userService.removePermission(username, roleName as Permission);
        sendWhisper(user.id, message);
    }

    async allowCommand(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const permissionName = args[1];
            const commandName = args[2];
            if (!permissionName) {
                sendWhisper(user.id, "Missing Permission Name - allow permission command");
                return;
            }
            if (!commandName) {
                sendWhisper(user.id, "Missing Command Name - allow permission command");
                return;
            }
            if (!isValidBasePermission(permissionName)) {
                sendWhisper(user.id, "Invalid Permission Name - allow permission command");
                return;
            }
            if (!isValidCommand(commandName)) {
                sendWhisper(user.id, "Invalid Command Name - allow permission command");
                return;
            }
            const { message } = await this.commandConfigService.allowCommand(commandName as Command['commandName'], permissionName as Permission);
            sendWhisper(user.id, message);
        } catch (error) {
            logger.error("Error Executing Allow Command", { error });
        }
    }

    async unallowCommand(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const permissionName = args[1];
            const commandName = args[2];
            if (!permissionName) {
                sendWhisper(user.id, "Missing Permission Name - allow permission command");
                return;
            }
            if (!commandName) {
                sendWhisper(user.id, "Missing Command Name - allow permission command");
                return;
            }
            if (!isValidBasePermission(permissionName)) {
                sendWhisper(user.id, "Invalid Permission Name - allow permission command");
                return;
            }
            if (!isValidCommand(commandName)) {
                sendWhisper(user.id, "Invalid Command Name - allow permission command");
                return;
            }
            const { message } = await this.commandConfigService.unallowCommand(commandName as Command['commandName'], permissionName as Permission);
            sendWhisper(user.id, message);
        } catch (error) {
            logger.error("Error Executing Allow Command", { error });
        }
    }

    async enableCommand(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const commandName = args[1];
            if (!commandName) {
                sendWhisper(user.id, "Missing Command Name - enable command");
                return;
            }
            if (!isValidCommand(commandName)) {
                sendWhisper(user.id, "Invalid Command Name - enable command");
                return;
            }
            const { message } = await this.commandConfigService.enableCommand(commandName as Command['commandName']);
            sendWhisper(user.id, message);
        } catch (error) {
            logger.error("Error Executing Enable Command", { error });
        }
    }

    async disableCommand(bot: HR, user: User, args: string[]): Promise<void> {
        try {
            const commandName = args[1];
            if (!commandName) {
                sendWhisper(user.id, "Missing Command Name - disable command");
                return;
            }
            if (!isValidCommand(commandName)) {
                sendWhisper(user.id, "Invalid Command Name - disable command");
                return;
            }
            const { message } = await this.commandConfigService.disableCommand(commandName as Command['commandName']);
            sendWhisper(user.id, message);
        } catch (error) {
            logger.error("Error Executing Disable Command", { error });
        }
    }
}

export default PermissionManagerCommand;