import { SchedulerConfig, SchedulerId } from "../interface/models";
import SchedulerConfigRepository from "../repositories/SchedulerConfigRepository";
import { getActiveRoomId } from "../utils/utils";
import schedulerConfigJson from "../seed/schedulerConfig.json";

class SchedulerConfigService {
    private readonly schedulerConfigRepo: SchedulerConfigRepository;
    constructor() {
        this.schedulerConfigRepo = new SchedulerConfigRepository();
    }

    public async getAllActiveRoomConfigs() {
        try {
            const roomId = await getActiveRoomId();
            const configs = await this.schedulerConfigRepo.find({ roomId });
            return configs;
        } catch (error) {
            throw new Error(`Failed to get active room configs: ${error}`);
        }
    }

    public async getSchedulerConfig(schedulerId: SchedulerId) {
        try {
            const roomId = await getActiveRoomId();
            return await this.schedulerConfigRepo.findOne({
                roomId,
                schedulerId
            });
        } catch (error) {
            throw new Error(`Failed to get scheduler config: ${error}`);
        }
    }

    public async disableScheduler(schedulerId: SchedulerId) {
        try {
            const schedulerConfig = await this.getSchedulerConfig(schedulerId);
            if (!schedulerConfig) return null;
            await this.schedulerConfigRepo.update(schedulerConfig.id, { isActive: false });
        } catch (error) {
            throw new Error(`Failed to disable scheduler: ${error}`);
        }
    }

    private async generateDefaultConfig(roomId: string): Promise<SchedulerConfig[]> {
        const existingConfigs = await this.schedulerConfigRepo.find({ roomId });
        if (existingConfigs.length === Object.keys(SchedulerId).length) return [];

        const defaultConfigValues = Object.keys(SchedulerId)
            .map(key => {
                const schedulerId = key as SchedulerId;
                const customDefault = schedulerConfigJson.find(item => item.schedulerId === schedulerId);

                const existingConfig = existingConfigs.find(config =>
                    config.schedulerId === schedulerId && config.roomId === roomId
                );

                return existingConfig ? null : {
                    id: `${schedulerId}_${roomId}`,
                    schedulerId: schedulerId,
                    roomId: customDefault?.roomId ?? roomId,
                    cronTime: customDefault?.cronTime ?? "* * * * *",
                    isActive: false
                };
            })
            .filter((config) => config !== null);

        return defaultConfigValues;
    }

    public async initialSchedulerConfigSetup() {
        try {
            const roomId = await getActiveRoomId();
            const defaultConfig = await this.generateDefaultConfig(roomId);
            if (defaultConfig.length == 0) {
                return [];
            }
            await this.schedulerConfigRepo.createMany(defaultConfig);
            return await this.schedulerConfigRepo.find({ roomId });
        } catch (error) {
            throw new Error(`Failed to initialize scheduler configs: ${error}`);
        }
    }
}

export default SchedulerConfigService;
