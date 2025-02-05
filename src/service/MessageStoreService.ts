import { MessageScope, MessageScopeExtra, MessageStore, MessageType } from "../interface/models";
import MessageStoreRepository from "../repositories/MessageStoreRepository";
import CommonConfigService from "./CommonConfigService";
import messageStoreData from "../seed/messageStore.json";
import logger from "../lib/winston";
import { getRandomFromArray } from "../utils/utils";

class MessageStoreService {
    private readonly commonConfigService: CommonConfigService;
    private readonly messageStoreRepo: MessageStoreRepository;
    constructor() {
        this.commonConfigService = new CommonConfigService();
        this.messageStoreRepo = new MessageStoreRepository();
    }

    // public async getMessageStore(messageType: MessageType): Promise<MessageStore | null> {
    //     try {
    //         const messageStoreConfig = await this.commonConfigService.getMessageConfig(messageType);
    //         let roomId;
    //         if (messageStoreConfig?.messageScope === MessageScope.ROOM) {
    //             roomId = await this.commonConfigService.getActiveRoomId();
    //         }
    //         if (!messageStoreConfig) return null;
    //         const messageStore = await this.messageStoreRepo.findByTypeAndScope(messageType, messageStoreConfig.messageScope, roomId);
    //         return messageStore;
    //     } catch (error) {
    //         logger.error("Error Fetching the message store data", { error });
    //         throw error;
    //     }
    // }

    public async getMessagesByType(messageType: MessageType): Promise<MessageStore[] | null> {
        try {
            const messageStoreConfig = await this.commonConfigService.getMessageConfig(messageType);
            const scopeSetting = messageStoreConfig?.messageScope;

            if (scopeSetting === MessageScopeExtra.NONE) return null;
            let response: MessageStore[] = [] as MessageStore[];
            if (!scopeSetting) return null;
            // If scope setting is Global
            if (scopeSetting === MessageScope.GLOBAL) {
                const msgStore = await this.messageStoreRepo.findByTypeAndScope(messageType, scopeSetting);
                if (msgStore) response.push(msgStore);
            }

            const roomId = await this.commonConfigService.getActiveRoomId();
            // If Scope setting is Roomj
            if (scopeSetting === MessageScope.ROOM) {
                const msgStore = await this.messageStoreRepo.findByTypeAndScope(messageType, scopeSetting, roomId);
                if (msgStore) response.push(msgStore);
            }

            // If scope setting is both
            if (scopeSetting === MessageScopeExtra.BOTH) {
                const globalMsgStore = await this.messageStoreRepo.findByTypeAndScope(messageType, MessageScope.GLOBAL);
                const roomMsgStore = await this.messageStoreRepo.findByTypeAndScope(messageType, MessageScope.ROOM, roomId);
                if (globalMsgStore) response.push(globalMsgStore);
                if (roomMsgStore) response.push(roomMsgStore);
            }

            // If scope setting is all
            if (scopeSetting === MessageScopeExtra.ALL) {
                const msgStore = await this.messageStoreRepo.find({ messageType: messageType });
                response.push(...msgStore);
            }

            return response;
        } catch (error) {
            logger.error("Failed to retrieve message store data", { error })
            return null;
        }
    }

    public async getGreetingMessage(): Promise<string | null> {
        const grabMsgData = await this.getMessagesByType(MessageType.GRAB);
        let messageArr: string[] = [];
        grabMsgData?.map(msgStore => messageArr.push(...msgStore.messages));
        return getRandomFromArray(messageArr);
    }

    public async getTriggerMessage(triggerMessageArr: string[]): Promise<string | null> {
        try {
            const triggerMessageData = await this.getMessagesByType(MessageType.TRIGGER);
            if (!triggerMessageData) {
                return null;
            }

            const triggerArray: string[] = [];
            triggerMessageData.forEach(msgStore => msgStore.trigger ? triggerArray.push(...msgStore.trigger) : "");
            const triggerIndex = triggerArray?.findIndex(trigger =>
                triggerMessageArr.some(word => trigger.toLowerCase() === word.toLowerCase())
            );
            if (!triggerIndex || triggerIndex === -1) return null;

            const messageArray: string[] = [];
            triggerMessageData.forEach(msgStore => messageArray.push(...msgStore.messages));

            if (triggerArray.length != messageArray.length) {
                logger.error("Length of trigger and message are not equal", { triggerLen: triggerArray.length, messageArray: messageArray });
                return null
            };

            const messagePipe = messageArray[triggerIndex].split("||");
            return getRandomFromArray(messagePipe);
        } catch (error) {
            logger.error("Error Fetching the trigger message", { error });
            throw error;
        }
    }

    public async initialMessageStoreSetup() {
        try {
            const isMessageDataExist = await this.messageStoreRepo.findAll();
            if (isMessageDataExist.length === 0) {
                await this.messageStoreRepo.createMany(messageStoreData as MessageStore[]);
                return true;
            }
        } catch (error) {
            logger.error("Error initializing message store", { error });
            throw error;
        }
    }
}

export default MessageStoreService;