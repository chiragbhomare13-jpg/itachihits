import { BasePermission, BasePermissionsConfig } from "../interface/models";
import logger from "../lib/winston";
import BasePermissionsRepository from "../repositories/BasePermissionsRepository";
import { getActiveRoomId, isValidBasePermission } from "../utils/utils";
import defaultPermissions from "../seed/basePermissionConfig.json";

class BasePermissionsService {
    private readonly basePermissionsRepo: BasePermissionsRepository;
    constructor() {
        this.basePermissionsRepo = new BasePermissionsRepository();
    }

    public async getBasePermissionsByName(permissionName: BasePermission): Promise<BasePermissionsConfig | null> {
        if (!isValidBasePermission(permissionName)) {
            logger.warn("Invalid Permission name: ", { permissionName })
            return null;
        }
        logger.info(`Looking for permission: ${permissionName}`);
        let response;
        response = await this.basePermissionsRepo.findOne({ permissionName });
        logger.info(`Found existing permission: ${response ? 'yes' : 'no'}`);
        if (!response) {
            response = await this.createBasePermissions(permissionName);
        }
        return response;
    }

    public async createBasePermissions(permissionName: BasePermission): Promise<BasePermissionsConfig | null> {
        logger.info(`Creating permission for: ${permissionName}`);
        const def = defaultPermissions.find(p => p.permissionName === permissionName);
        logger.info(`Found default config: ${def ? 'yes' : 'no'}`, { defaultConfig: def });
        
        const roomId = await getActiveRoomId();
        logger.info(`Active room ID: ${roomId}`);
        
        const basePermissionsPayload: BasePermissionsConfig = {
            id: `${permissionName}_${roomId}`,
            roomId: roomId,
            permissionName: permissionName,
            assignableBy: def?.assignableBy.map(p => p as BasePermission) ?? [BasePermission.CREATOR, BasePermission.OWNER]
        };
        logger.info(`Creating permission with payload:`, basePermissionsPayload);
        
        try {
            const response = await this.basePermissionsRepo.create(basePermissionsPayload);
            logger.info(`Permission created successfully:`, response);
            return response;
        } catch (error) {
            logger.error(`Failed to create permission:`, error);
            return null;
        }
    }

}

export default BasePermissionsService;
