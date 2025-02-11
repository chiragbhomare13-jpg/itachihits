import SchedulerConfigService from '../service/SchedulerConfigService';
import SchedulerManager from './SchedulerManager';
import HR from 'hr-sdk';
import SchedulerTaskDefinition from './SechedulerTaskDefinition';
import hrCache from '../utils/cache';
import { cacheKey } from '../utils/constant';

class SchedulerInitializer {
    private readonly scheduler: SchedulerManager;
    private readonly schedulerConfigService: SchedulerConfigService;
    private readonly taskDefinition: SchedulerTaskDefinition;

    constructor(private readonly bot: HR = hrCache.get(cacheKey.bot)) {
        this.scheduler = SchedulerManager.getInstance();
        this.schedulerConfigService = new SchedulerConfigService();
        this.taskDefinition = new SchedulerTaskDefinition(this.bot);
    }

    async init() {
        const configs = await this.schedulerConfigService.getAllSchedulerConfigs();
        if (configs.length === 0) return;
        for (const config of configs) {
            const handler = this.taskDefinition.getTaskById(config.schedulerId);
            if (!handler) {
                console.error(`No handler found for scheduler ID: ${config.schedulerId}`);
                continue;
            }

            await this.scheduler.addTask(
                config.schedulerId,
                config.cronTime,
                handler
            );
            if (config.isActive) {
                await this.scheduler.startTask(config.schedulerId);
            }
        }
    }

    stopTask(taskId: string) {
        this.scheduler.stopTask(taskId);
    }

    startTask(taskId: string) {
        this.scheduler.startTask(taskId);
    }

    getTasksStatus() {
        return this.scheduler.getAllTasks();
    }

    async reinitialize() {
        this.scheduler.stopAndRemoveAllTasks();
        await this.init();
    }

    async stopAndRemoveAll() {
        this.scheduler.stopAndRemoveAllTasks();
    }
}

export default SchedulerInitializer;
