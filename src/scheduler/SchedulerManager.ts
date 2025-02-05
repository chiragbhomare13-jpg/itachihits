import cron from 'node-cron';
import logger from '../lib/winston';

interface ScheduledTask {
    id: string;
    cronExpression: string;
    task: () => Promise<void>;
    cronTask?: cron.ScheduledTask;
    isRunning: boolean;
}

class SchedulerManager {
    private static instance: SchedulerManager | null = null;
    private readonly scheduledTasks: Map<string, ScheduledTask> = new Map();

    private constructor() { }

    public static getInstance(): SchedulerManager {
        if (!SchedulerManager.instance) {
            SchedulerManager.instance = new SchedulerManager();
        }
        return SchedulerManager.instance;
    }

    async addTask(taskId: string, cronExpression: string, task: () => Promise<void>): Promise<void> {
        if (this.scheduledTasks.has(taskId)) {
            logger.warn(`Task with ID ${taskId} already exists.`);
            return;
        }

        const scheduledTask: ScheduledTask = {
            id: taskId,
            cronExpression,
            task,
            isRunning: false
        };

        this.scheduledTasks.set(taskId, scheduledTask);
        logger.info(`Task ${taskId} added with cron expression: ${cronExpression}`);
    }

    async startTask(taskId: string): Promise<void> {
        const task = this.scheduledTasks.get(taskId);

        if (!task) {
            logger.error(`Task ${taskId} not found.`);
            return;
        }

        if (task.isRunning) {
            logger.warn(`Task ${taskId} is already running.`);
            return;
        }

        task.cronTask = cron.schedule(task.cronExpression, async () => {
            try {
                await task.task();
            } catch (error) {
                logger.error(`Error executing task ${taskId}: ${error}`);
            }
        });

        task.isRunning = true;
        logger.info(`Task ${taskId} started.`);
    }

    stopTask(taskId: string): void {
        const task = this.scheduledTasks.get(taskId);

        if (!task) {
            logger.error(`Task ${taskId} not found.`);
            return;
        }

        if (!task.isRunning) {
            logger.warn(`Task ${taskId} is not running.`);
            return;
        }

        task.cronTask?.stop();
        task.isRunning = false;
        logger.info(`Task ${taskId} stopped.`);
    }

    removeTask(taskId: string): void {
        const task = this.scheduledTasks.get(taskId);

        if (!task) {
            logger.error(`Task ${taskId} not found.`);
            return;
        }

        if (task.isRunning) {
            this.stopTask(taskId);
        }

        this.scheduledTasks.delete(taskId);
        logger.info(`Task ${taskId} removed.`);
    }

    getTaskStatus(taskId: string): { exists: boolean; isRunning: boolean } {
        const task = this.scheduledTasks.get(taskId);
        return {
            exists: !!task,
            isRunning: task?.isRunning || false
        };
    }

    getAllTasks(): Array<{ id: string; cronExpression: string; isRunning: boolean }> {
        return Array.from(this.scheduledTasks.values()).map(task => ({
            id: task.id,
            cronExpression: task.cronExpression,
            isRunning: task.isRunning
        }));
    }

    stopAndRemoveAllTasks(): void {
        const taskIds = Array.from(this.scheduledTasks.keys());
        for (const taskId of taskIds) {
            this.removeTask(taskId);
        }
        logger.info('All tasks stopped and removed.');
    }
}

export default SchedulerManager;
