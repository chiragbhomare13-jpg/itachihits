import { MessageScope, MessageScopeExtra, MessageStore, MessageType } from "../interface/models";
import logger from "../lib/winston";
import BaseRepository from "./BaseRepository";
import { models } from "./dbDataConfig";


class MessageStoreRepository extends BaseRepository<MessageStore> {
    constructor() {
        super(models.MessageStore.name, models.MessageStore.dbPath, models.MessageStore.isRoomSpecific);
    }

    async findByTypeAndScope(messageType: MessageType, messageScope: MessageScope, roomId?: string) {
        try {
            await this.ensureInitialized();
            if (messageScope === MessageScope.ROOM && !roomId) {
                throw new Error('roomId is required when messageScope is ROOM');
            }
            const query: Partial<MessageStore> = {
                messageType: messageType,
                messageScope: messageScope
            }
            if (messageScope === MessageScope.ROOM) {
                query.roomId = roomId;
            }
            const result = await this.collection.findOne(query)
            return result;
        } catch (error) {
            logger.error("Error Fetching MessageStore", { error });
            throw error;
        }
    }
}

export default MessageStoreRepository;