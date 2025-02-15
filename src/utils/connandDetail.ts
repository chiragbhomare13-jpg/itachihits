import { ChatCommandStringUnion } from "../interface";
import { ChatCommand } from "../interface/models";

export const chatCommandDefaultConf: Partial<Record<ChatCommandStringUnion, Partial<ChatCommand>>> = {
    "hello": {
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'hello'],
    },
    "follow": {
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'follow'],
    },
    "unfollow": {
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'unfollow']
    },
    "add": {
        canExecute: true
    },
    "unadd": {
        canExecute: true
    }
}