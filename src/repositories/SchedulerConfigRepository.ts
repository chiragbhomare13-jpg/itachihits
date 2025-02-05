import { SchedulerConfig } from "../interface/models";
import BaseRepository from "../repositories/BaseRepository";
import { models } from "./dbDataConfig";

class SchedulerConfigRepository extends BaseRepository<SchedulerConfig> {
    constructor() {
        super(models.SchedulerConfig.name, models.SchedulerConfig.dbPath, models.SchedulerConfig.isRoomSpecific);
    }
}

export default SchedulerConfigRepository;