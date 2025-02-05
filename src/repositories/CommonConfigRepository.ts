import { CommonConfig } from "../interface/models";
import BaseRepository from "./BaseRepository";
import { models } from "./dbDataConfig";


class CommonConfigRepository extends BaseRepository<CommonConfig> {
    constructor() {
        super(models.CommonConfig.name, models.CommonConfig.dbPath, models.CommonConfig.isRoomSpecific);
    }
}

export default CommonConfigRepository;