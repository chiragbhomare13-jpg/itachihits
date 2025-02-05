import { AnchorPosition, Position } from "hr-sdk";
import { ChatCommandStringUnion, MessageCommandStringUnion } from ".";

export interface IBaseItem {
    id: string | number;
}

export interface BaseRoomId {
    roomId: string
}
export enum BasePermission {
    CREATOR = 'creator',
    OWNER = 'owner',
    DESIGNER = 'designer',
    MODERATOR = 'moderator',
    VIP = 'vip',
    DJ = 'dj',
    USER = 'user'
}

export type Permission = `${BasePermission}` | MessageCommandStringUnion | ChatCommandStringUnion;
export enum MessageType {
    GRAB = 'GRAB',
    GREETING = 'GREETING',
    TRIGGER = 'TRIGGER',
    FAREWELL = 'FAREWELL'
}

export enum MessageScope {
    GLOBAL = 'GLOBAL',
    ROOM = 'ROOM'
}

export enum MessageScopeExtra {
    ALL = 'ALL', // All messages that exist with message type regardless of scope.
    BOTH = 'BOTH', // It will pick from global scope and that particular room scope.
    NONE = 'NONE' //  It will disable all messages just for config purposes to disable.
}

export interface ChatCommand {
    commandType: "CHAT";
    commandName: ChatCommandStringUnion;
    canExecute: boolean;
    requirePermission: boolean;
    allowedPermission: Permission[];
    assignableBy: Permission[];
}

export interface MessageCommand {
    commandType: "MESSAGE";
    commandName: MessageCommandStringUnion;
    canExecute: boolean;
    requirePermission: boolean;
    allowedPermission: Permission[];
    assignableBy: Permission[];
}
export type Command = ChatCommand | MessageCommand;

/**
 * @model User
 */
export interface User extends IBaseItem {
    username: string;
    userId: string;
    email?: string;
    wallet: number;
    permission: Permission[];
    subscription: SubscriptionStatus;
}

export interface SubscriptionStatus {
    subscriptionPlanId: string;
    subscriptionPlanType: SubscriptionType;
    isActive: boolean;
    autoRenew: boolean;
    expiresAt: number;
    cancelledAt?: number;
}

export enum SubscriptionType {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    PRO = 'PRO'
}

export interface SubscriptionPlan {
    id: string;
    name: SubscriptionType;
    price: number;
    duration: number;
    features: string[];
    maxSlots: number;
    isActive: boolean;
}

export interface Music extends IBaseItem {
    userId: string;
    favourite: string[];
    slots: number;
}

export interface TransactionsHistory extends IBaseItem {
    userId: string;
    username: string;
    amount: number;
    receiverId: string;
    receiverName: string;
}


/**
 * @model RoomConfig
 */
export interface RoomConfig extends IBaseItem, BaseRoomId {
    roomName: string;
    roomOwnerId: string;
    startingPosition?: Position | AnchorPosition;
}


/**
 * @model MessageStore
 */
export interface MessageStore extends IBaseItem {
    messageType: MessageType,
    messageScope: MessageScope,
    isActive: boolean,
    messages: string[],
    roomId?: string,
    trigger?: string[],
}

/**
 * @model SchedulerConfig
 */
export enum SchedulerId {
    GRAB_MESSAGE = 'GRAB_MESSAGE'
}
export interface SchedulerConfig extends IBaseItem, BaseRoomId {
    schedulerId: SchedulerId;
    isActive: boolean;
    cronTime: string;
}

/**
 * @model CommandConfig
 */
export interface CommandConfig extends BaseRoomId, IBaseItem {
    commands: Command[],
}

/**
 * @model CommonConfig
 */
export type MessageConfig = {
    messageType: MessageType;
    messageScope: MessageScope | MessageScopeExtra;
}
export interface CommonConfig extends IBaseItem {
    activeRoomId: string;
    messageConfig: MessageConfig[];
    highriseTokenId: string;
    creatorId: string;
    commandPrefix: string;
}

export interface BasePermissionsConfig extends IBaseItem, BaseRoomId {
    permissionName: BasePermission;
    assignableBy: BasePermission[];
}