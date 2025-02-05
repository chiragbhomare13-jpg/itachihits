import { BasePermissionsConfig } from "../interface/models";
import BaseRepository from "./BaseRepository";
import { models } from "./dbDataConfig";

class BasePermissionsRepository extends BaseRepository<BasePermissionsConfig> {
    constructor() {
        super(models.BasePermissionsConfig.name, models.BasePermissionsConfig.dbPath, models.BasePermissionsConfig.isRoomSpecific);
    }
}

export default BasePermissionsRepository;