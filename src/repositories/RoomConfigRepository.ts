import { RoomConfig } from "../interface/models";
import BaseRepository from "../repositories/BaseRepository";
import { models } from "./dbDataConfig";

class RoomConfigRepository extends BaseRepository<RoomConfig> {
    constructor() {
        super(models.RoomConfig.name, models.RoomConfig.dbPath, models.RoomConfig.isRoomSpecific);
    }
}

export default RoomConfigRepository;