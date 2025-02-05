import { Command, CommandConfig } from "../interface/models";
import BaseRepository from "../repositories/BaseRepository";
import hrCache from "../utils/cache";
import { models } from "./dbDataConfig";

class CommandConfigRepository extends BaseRepository<CommandConfig> {
    constructor() {
        super(models.CommandConfig.name, models.CommandConfig.dbPath, models.CommandConfig.isRoomSpecific);
    }
    async findCommandByName(name: string): Promise<Command | null> {
        const roomId = hrCache.get('roomId');
        if (!roomId) return null

        await this.ensureInitialized();
        const commandConfig = await this.collection.findOne({ roomId: roomId });
        if (!commandConfig) {
            return null;
        }
        const commandDetail = commandConfig.commands.find(command => command.commandName === name);
        return commandDetail ?? null;
    }
}

export default CommandConfigRepository;