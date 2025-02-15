import HR, { MessageEvent, User } from "hr-sdk";
import { chatCommandMap, messageCommandMap } from "../utils/constant";

export interface ChatCommand {
    execute(bot: HR, user: User, args: string[]): Promise<void> | void;
}

export interface MessageCommand {
    execute(bot: HR, user: User, args: string[], conversation: MessageEvent): Promise<void> | void;
}

type DbModelName = 'User' | 'Music' | 'CommonConfig' | 'RoomConfig' | 'CommandConfig' | 'MessageStore' | 'SchedulerConfig' | 'BasePermissionsConfig';
export type DbModel = Record<DbModelName, { name: string, dbPath: string, isRoomSpecific: boolean }>

export type ChatCommandStringUnion = keyof typeof chatCommandMap;
export type ChatCommandPermission = Record<ChatCommandStringUnion, object>;

export type MessageCommandStringUnion = keyof typeof messageCommandMap;
export type MessageCommandPermission = Record<MessageCommandStringUnion, object>;

export type supportedPlatform = "jiosaavn" | "youtube" | "soundcloud"
export interface InteractionResponse {
    message: string;
    endInteraction?: boolean;
}

export interface HandlerInteractionResult {
    nextStep?: number;
    skipTo?: string;
    end?: boolean;
    data?: Record<string, any>;
}
export interface InteractionStep {
    name?: string;
    prompt: string | ((data: Record<string, any>) => string);
    handler: (input: string, data: Record<string, any>) => void | HandlerInteractionResult;
}
export type InteractionOnComplete = (data: Record<string, any>) => string;
export interface InteractionRegistry {
    steps: InteractionStep[];
    onComplete: InteractionOnComplete;
}