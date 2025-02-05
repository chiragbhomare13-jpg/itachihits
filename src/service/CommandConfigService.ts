import { ChatCommand, Command, CommandConfig, MessageCommand, Permission } from "../interface/models";
import logger from "../lib/winston";
import CommandConfigRepository from "../repositories/CommandConfigRepository";
import { chatCommandDefaultConf, messageCommandDefaultConf } from "../utils/constant";
import { isValidCommand } from "../utils/utils";
import CommonConfigService from "./CommonConfigService";

class CommandConfigService {
    private readonly commandConfigRepo: CommandConfigRepository;
    private readonly commonConfigService: CommonConfigService;
    constructor() {
        this.commandConfigRepo = new CommandConfigRepository();
        this.commonConfigService = new CommonConfigService();
    }

    private generateChatCommand(commandName: Command['commandName']): ChatCommand {
        const conf = chatCommandDefaultConf[commandName as keyof typeof chatCommandDefaultConf];
        return {
            allowedPermission: conf?.allowedPermission ?? ['creator', 'owner', commandName],
            assignableBy: conf?.assignableBy ?? ['creator', 'owner'],
            canExecute: conf?.canExecute ?? true,
            commandName: commandName,
            commandType: 'CHAT',
            requirePermission: conf?.requirePermission ?? true
        } as ChatCommand
    }


    private generateMessageCommand(commandName: Command['commandName']): MessageCommand {
        const conf = messageCommandDefaultConf[commandName as keyof typeof messageCommandDefaultConf];
        return {
            allowedPermission: conf?.allowedPermission ?? ['creator', 'owner', commandName],
            assignableBy: conf?.assignableBy ?? ['creator', 'owner'],
            canExecute: conf?.canExecute ?? true,
            commandName: commandName,
            commandType: 'MESSAGE',
            requirePermission: conf?.requirePermission ?? true
        } as MessageCommand
    }

    public async getCommandConfig() {
        try {
            const roomId = await this.commonConfigService.getActiveRoomId();
            let commandConfig = await this.commandConfigRepo.findById(roomId);

            if (!commandConfig) {
                const payload: CommandConfig = {
                    id: roomId,
                    roomId: roomId,
                    commands: [],
                }
                commandConfig = await this.commandConfigRepo.create(payload);
            }
            return commandConfig;
        } catch (error) {
            logger.error("Error Creating or fetching Command Config", { error })
            throw error;
        }
    }

    public async getCommandDetail(commandType: "CHAT" | "MESSAGE", commandName: string): Promise<ChatCommand | MessageCommand | null> {
        const isValid = isValidCommand(commandName);
        if (!isValid) {
            return null;
        }
        let commandConfig = await this.getCommandConfig();
        let response;
        if (!commandConfig) { return null; }

        response = commandConfig.commands.find(
            command => command.commandType === commandType && command.commandName === commandName
        ) ?? null;

        if (!response) {
            response = await this.createCommand(commandType, commandName);
        }
        response = commandConfig.commands.find(
            command => command.commandType === commandType && command.commandName === commandName
        ) ?? null;

        return response
    }

    public async createCommand(commandType: "CHAT" | "MESSAGE", commandName: string): Promise<CommandConfig | null> {
        try {
            const commandConfig = await this.getCommandConfig();
            if (!commandConfig) return null;
            if (commandType === "CHAT") {
                const chatCommand = this.generateChatCommand(commandName as Command['commandName']);
                commandConfig.commands.push(chatCommand);
            } else if (commandType === "MESSAGE") {
                const messageCommand = this.generateMessageCommand(commandName as Command['commandName']);
                commandConfig.commands.push(messageCommand);
            }
            const response = await this.commandConfigRepo.update(commandConfig.id, { commands: commandConfig.commands });
            return response;
        } catch (error) {
            logger.error("Error Adding Command", { commandName, error });
            throw error;
        }
    }

    public async allowCommand(commandName: Command['commandName'], permissionName: Permission): Promise<Record<string, any>> {
        try {
            const commandConfig = await this.getCommandConfig();
            if (!commandConfig) return { message: "Command Config not found" };

            const command = await this.getCommandDetail('CHAT', commandName);

            if (!command) {
                return { message: `Command ${commandName} not found in configuration.` };
            }

            if (command.allowedPermission.includes(permissionName)) {
                return { message: "This permission already exists." }
            }

            command.allowedPermission.push(permissionName);
            await this.commandConfigRepo.update(commandConfig.id, { commands: commandConfig.commands });
            return { message: "Command Allowed Successfully" }
        } catch (error) {
            logger.error("Error allowing command", { commandName, permissionName, error });
            return { message: "Error Allowing Command" }
        }
    }

    public async unallowCommand(commandName: Command['commandName'], permissionName: Permission): Promise<Record<string, any>> {
        try {
            const commandConfig = await this.getCommandConfig();
            if (!commandConfig) return { message: "Command Config not found" };

            const command = await this.getCommandDetail('CHAT', commandName);
            if (!command) {
                return { message: `Command ${commandName} not found in configuration.` };
            }

            command.allowedPermission = command.allowedPermission.filter(perm => perm !== permissionName);

            await this.commandConfigRepo.update(commandConfig.id, { commands: commandConfig.commands });
            return { message: "Command Unallowed Successfully" };
        } catch (error) {
            logger.error("Error unallowing command", { commandName, permissionName, error });
            return { message: "Error Unallowing Command" };
        }
    }

    public async enableCommand(commandName: Command['commandName']): Promise<Record<string, any>> {
        try {
            const commandConfig = await this.getCommandConfig();
            if (!commandConfig) return { message: "Command Config not found" };
            const command = await this.getCommandDetail('CHAT', commandName);

            if (!command) {
                return { message: `Command ${commandName} not found in configuration.` };
            }

            if (command.canExecute) {
                return { message: "Command is already enabled." }
            }

            command.canExecute = true;
            await this.commandConfigRepo.update(commandConfig.id, { commands: commandConfig.commands });
            return { message: "Command Enabled Successfully" };
        } catch (error) {
            logger.error("Error enabling command", { commandName, error });
            return { message: "Error Enabling Command" };
        }
    }

    public async disableCommand(commandName: Command['commandName']): Promise<Record<string, any>> {
        try {
            const commandConfig = await this.getCommandConfig();
            if (!commandConfig) return { message: "Command Config not found" };

            const command = await this.getCommandDetail('CHAT', commandName);

            if (!command) {
                return { message: `Command ${commandName} not found in configuration.` };
            }
            if (!command.canExecute) {
                return { message: "Command is already disabled." }
            }

            command.canExecute = false;
            await this.commandConfigRepo.update(commandConfig.id, { commands: commandConfig.commands });
            return { message: "Command Disabled Successfully" };
        } catch (error) {
            logger.error("Error disabling command", { commandName, error });
            return { message: "Error Disabling Command" };
        }
    }

}

export default CommandConfigService;