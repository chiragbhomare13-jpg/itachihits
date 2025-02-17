import HR, { Position, User, webApi } from "hr-sdk";
import { chatCommandMap, messageCommandMap } from "./constant";
import CommandConfigService from "../service/CommandConfigService";
import UserService from "../service/UserService";
import logger from "../lib/winston";
import hrCache from "./cache";
import CommonConfigService from "../service/CommonConfigService";
import { BasePermission } from "../interface/models";
import BasePermissionsService from "../service/BasePermissionsConfigService";


export const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @description Convert Message to arguments seperated by space and return array.
 * @param message 
 */
export function getMessageToArgs(message: string): Array<string> | null {
    if (!message) {
        return null;
    }
    return message.split(" ");
}

export function getBotInstance(): HR {
    return hrCache.get('bot');
}

export async function getActiveRoomId(): Promise<string> {
    const commonConfig = new CommonConfigService();
    return await commonConfig.getActiveRoomId();
}
export async function isMod(bot: HR, user: User) {
    const response = await bot.action.getRoomPrivilege({ userId: user.id });
    return response.moderator;
}

export async function isDesigner(bot: HR, user: User) {
    const response = await bot.action.getRoomPrivilege({ userId: user.id });
    return response.designer;
}

/**
 * @description Extract username from the args with @ given
 * @param {string} message 
 */
export function usernameExtractor(message: string): string | null {
    if (message?.startsWith("@")) {
        return message.slice(1);
    }
    return null;
}

export async function getUsernameByUserId(userId: string) {
    const user = await webApi.getUserByUsername(userId);
    return user;
}

export async function getUserIdByUsername(username: string) {
    try {
        const user = await webApi.getUserByUsername(username);
        return user;
    } catch (error) {
        logger.error("Error in getUserIdByUsername", { error })
    }
}

export async function getLastUserMessage(bot: HR, conversationId: string, userId: string) {
    try {
        const conversation = await bot.action.getConversation({});
        const conversationArr = conversation.conversations;
        const lastMessage = conversationArr.find((item) => item?.lastMessage?.conversationId === conversationId);
        return lastMessage?.lastMessage.content;
    } catch (error: any) {
        logger.error("Error in getLastUserMessage", { error, name: error?.message, })
    }
}

export function isCommandValid(command: string) {
    return Object.keys(chatCommandMap).includes(command);
}

export function isMessageCommandValid(command: string) {
    return Object.keys(messageCommandMap).includes(command);
}

export async function isBotDesignerAndMod(roomId: string): Promise<{ moderator: boolean, designer: boolean }> {
    try {
        const roomDetail = await webApi.getRoomById(roomId);
        const botId = hrCache.get('botId');
        const isMod = roomDetail.moderatorIds.includes(botId);
        const isDesiger = roomDetail.designerIds.includes(botId);
        return { moderator: isMod, designer: isDesiger };
    } catch (error) {
        logger.error(`Error fetching the bot moderation and designer data`, { error });
        throw error;
    }
}

export async function getUserPosition(bot: HR, userId: string) {
    const currentUser = await bot.action.getRoomUserByUserId(userId);
    return currentUser[1]
}

export function getDebugInfo(): { fileName: string; lineNumber: string; functionName: string } | null {
    try {
        // Throwing an error to capture the current stack trace
        throw new Error();
    } catch (error) {
        if (error instanceof Error && error.stack) {
            // Splitting the stack trace into lines
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 2) {
                // Extracting the relevant stack trace line (caller line)
                const callerLine = stackLines[2];
                const regex1 = /at (\S+) \((.*):(\d+):\d+\)/;
                const regex2 = /at (.*):(\d+):\d+/;
                const match = regex1.exec(callerLine) || regex2.exec(callerLine);

                if (match) {
                    return {
                        functionName: match[1],
                        fileName: match[2],
                        lineNumber: match[3],
                    };
                }
            }
        }
    }
    return null;
}

export function hasCommonElement<T>(array1: T[], array2: T[]): boolean {
    return array1.some(value => array2.includes(value));
}


/**
 * @description Returns true if if he authorized to use the specified command.
 * @param commandType 
 * @param commandName 
 * @param user 
 * @param bot 
 * @returns 
 */
export async function isAuthorized(
    commandType: "CHAT" | "MESSAGE",
    commandName: string,
    user: User,
    bot: HR
): Promise<boolean> {
    const commandConfigService = new CommandConfigService();
    const isValid = isValidCommand(commandName);
    if (!isValid) {
        logger.warn("Not a valid Command", { commandType, commandName });
    }
    const commandDetail = await commandConfigService.getCommandDetail(commandType, commandName);

    if (!commandDetail) {
        logger.warn(`Command not found: ${commandType} - ${commandName}`);
        return false;
    }

    // Check if the command can be executed
    if (!commandDetail.canExecute) {
        logger.warn(`This Command is disabled Command Name: ${commandName}`);
        return false;
    }

    // If no permission is required, allow execution
    if (!commandDetail.requirePermission) {
        return true;
    }
    const userService = new UserService();
    const userDetail = await userService.getUser(user, bot);
    // Check if the user's permissions intersect with the allowed permissions
    const isAuthorized = hasCommonElement(commandDetail.allowedPermission, userDetail?.permission ?? []);

    return isAuthorized;
}

/**
 * @description Returns true if if he authorized to use the specified command.
 * @param commandType 
 * @param commandName 
 * @param user 
 * @param bot 
 * @returns 
 */
export async function hasAssignPermission(
    commandType: "CHAT" | "MESSAGE",
    roleName: string,
    user: User,
    bot: HR
): Promise<boolean> {

    const commandConfigService = new CommandConfigService();
    const commandDetail = await commandConfigService.getCommandDetail(commandType, roleName);
    let basePermissionDetail;
    if (!commandDetail) {
        const basePermissionService = new BasePermissionsService();
        basePermissionDetail = await basePermissionService.getBasePermissionsByName(roleName as BasePermission)
    }
    const userService = new UserService();
    const userDetail = await userService.getUser(user, bot);
    // Check if the user's permissions intersect with the assign permissions
    let hasAssignPermission;
    if (commandDetail) {
        hasAssignPermission = hasCommonElement(commandDetail.assignableBy, userDetail?.permission ?? []);
    } else if (basePermissionDetail) {
        hasAssignPermission = hasCommonElement(basePermissionDetail?.assignableBy, userDetail?.permission ?? []);
    } else {
        hasAssignPermission = false;
    }

    return hasAssignPermission;
}

export function isValidBasePermission(roleName: string): boolean {
    return Object.values(BasePermission).includes(roleName as BasePermission);

}
export function isValidCommand(commandName: string): boolean {
    const isMessageCommand = Object.keys(messageCommandMap).includes(commandName);
    const isChatCommand = Object.keys(chatCommandMap).includes(commandName);
    return isMessageCommand || isChatCommand
}

export function isValidRole(roleName: string) {
    const isBasePermission = isValidBasePermission(roleName);
    const isValid = isValidCommand(roleName);
    return isValid || isBasePermission;
}

export async function getCommandPrefix(): Promise<string> {
    const commonConfigService = new CommonConfigService();
    const prefix = await commonConfigService.getCommandPrefix();
    return prefix;
}

export function isOwner(userId: string) {
    return userId === hrCache.get('ownerId');
}

export async function isCreator(userId: string) {
    const config = new CommonConfigService();
    let creatorId = await config.getCreatorId();
    return creatorId === userId;
}

export function separateStringAndNumbers(input: string): { letters: string, numbers: string } {
    const letters = input.replace(/\d/g, '');
    const numbers = input.replace(/\D/g, '');
    return { letters, numbers };
}
export const AnchorPosition = [];
export function hasRequiredKeys(obj: any, keys: string[]): boolean {
    return keys.every(key => key in obj);
}

export function isPosition(obj: any): obj is Position {
    return obj && hasRequiredKeys(obj, ['x', 'y', 'z', 'facing']);
}

/**
 * @description Generates a record of command entries with keys based on a prefix and an index.
 *
 * @template T - The type of the command class instance.
 * @param {string} prefix - The prefix to use for each command key.
 * @param {number} length - The number of command entries to generate.
 * @param {new () => T} commandClass - The class constructor for the command instances.
 * @returns {Record<string, T>} A record where each key is a combination of the prefix and an index, and each value is an instance of the command class.
 */
export function generateCommandEntries<T>(
    prefix: string,
    length: number,
    commandClass: new () => T
): Record<string, T> {
    return Object.fromEntries(
        Array.from({ length }, (_, i) => [
            `${prefix}${i + 1}` as keyof typeof chatCommandMap,
            new commandClass()
        ])
    );
}

/**
 * @description Function to pick a random value from an array
 * @param arr 
 * @returns 
 */
export const getRandomFromArray = <T>(arr: T[]): T | null => {
    if (!Array.isArray(arr) || arr.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
};

export function generateId(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    id += chars[Math.floor(Math.random() * 26)];

    for (let i = 1; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

/**
 * Converts a time interval string (e.g., '10s', '5m', '2h') to a cron job string
 * Supports: s (seconds), m (minutes), h (hours), d (days)
 */
export function intervalToCron(interval: string) {
    if (typeof interval !== 'string') {
        throw new Error('Interval must be a string');
    }

    const regex = /^(\d+)([smhd])$/;
    const match = regex.exec(interval);
    if (!match) {
        throw new Error('Invalid interval format. Use format like "10s", "5m", "2h", "1d"');
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
        case 's':
            if (numValue < 0 || numValue > 59) {
                throw new Error('Seconds must be between 0 and 59');
            }
            return `*/${numValue} * * * * *`;

        case 'm':
            if (numValue < 0 || numValue > 59) {
                throw new Error('Minutes must be between 0 and 59');
            }
            return `0 */${numValue} * * * *`;

        case 'h':
            if (numValue < 0 || numValue > 23) {
                throw new Error('Hours must be between 0 and 23');
            }
            return `0 0 */${numValue} * * *`;

        case 'd':
            if (numValue < 1 || numValue > 31) {
                throw new Error('Days must be between 1 and 31');
            }
            return `0 0 0 */${numValue} * *`;

        default:
            throw new Error('Unsupported time unit');
    }
}

export function formatSongTitle(title: string, maxLength: number = 50) {
    if (!title) return '';

    // Split by common separators and prioritize the first part
    const separators = ['|', '-'];
    let mainTitle = title;
    
    for (const sep of separators) {
        if (title.includes(sep)) {
            mainTitle = title.split(sep)[0].trim();
            break;
        }
    }

    // Remove unnecessary words and brackets
    mainTitle = mainTitle.replace(/\[.*?\]/g, '') // Remove text inside brackets
                         .replace(/(Now playing|Lyrical video|Official Video|HD|Audio|Video|Full Song)/gi, '') // Remove keywords
                         .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
                         .trim();

    // Shorten if too long
    if (mainTitle.length > maxLength) {
        mainTitle = mainTitle.substring(0, maxLength - 3).trim() + '...';
    }

    return mainTitle;
}