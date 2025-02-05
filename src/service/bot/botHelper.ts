import HR, { MessageType } from "hr-sdk";
import { getBotInstance } from "../../utils/utils";
import { MessageSplitter } from "../../utils/messageSplitter";

export function sendDirectMessage(conversationId: string, message?: string) {
    const bot = getBotInstance();
    if (message && conversationId) {
        const trimmedMessage = message.length > 250 ? message.substring(0, 250) : message;
        bot.action.sendMessageToUser({ conversationId: conversationId, content: trimmedMessage, type: MessageType.text });
    }
}

export function SendDirectMessageByUserId(userId: string, message?: string) {
    const bot = getBotInstance();
    if (message && userId) {
        const conversationId = `1_on_1:${userId}:660e378047154a16bdf1b168`;
        bot.action.sendMessageToUser({ conversationId: conversationId, content: message, type: MessageType.text});
    }
}

export function sendWhisper(userId: string, message: string) {
    const bot = getBotInstance();
    if (message && userId) {
        const messageChunks = MessageSplitter.splitMessage(message);
        messageChunks.forEach(chunk => {
            bot.action.whisper({
                whisperTargetId: userId,
                message: chunk
            });
        });
    }
}

export function sendChat(message: string) {
    const bot = getBotInstance();
    if (message) {
        const messageChunks = MessageSplitter.splitMessage(message);
        messageChunks.forEach(chunk => {
            bot.action.broadcastMessage(chunk);
        })
    }
}

export function sendInviteMessageToUser(bot: HR, conversationId: string, id: string) {
    // bot.action.sendMessageToUser({conversationId: conversationId, })
}
