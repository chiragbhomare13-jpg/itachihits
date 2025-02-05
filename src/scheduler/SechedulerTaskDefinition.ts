import HR from "hr-sdk";
import { SchedulerId } from "../interface/models";
import MessageStoreService from "../service/MessageStoreService";

class SchedulerTaskDefinition {
    constructor(private readonly bot: HR) {}
    
    getTaskById(taskId: SchedulerId): (() => Promise<void>) | undefined {
        const taskMap: Record<SchedulerId, () => Promise<void>> = {
            [SchedulerId.GRAB_MESSAGE]: this.sendMessageToChat.bind(this),
        };

        return taskMap[taskId];
    }
    async sendMessageToChat() {
        const messageStore = new MessageStoreService();
        const msgs = await messageStore.getGreetingMessage();
        if (msgs) {
            this.bot.action.broadcastMessage(msgs);
        }
    }

}

export default SchedulerTaskDefinition;