import { Music } from "../interface/models";
import BaseRepository from "../repositories/BaseRepository";
import { models } from "./dbDataConfig";

class MusicRepository extends BaseRepository<Music> {
    constructor() {
        super(models.Music.name, models.Music.dbPath, models.SchedulerConfig.isRoomSpecific);
    }
}

export default MusicRepository;