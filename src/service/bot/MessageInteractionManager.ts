import { User } from "hr-sdk";
import { InteractionCache, InteractionState, ReceivedMessageType } from "../../utils/interactionCache";
import { HandlerInteractionResult, InteractionRegistry, InteractionResponse, InteractionStep } from "../../interface";
import { interactionCommandRegistry } from "../../handler/message-handler/interaction-manager/interactionCommandResigtry";

class MessageInteractionManager {
    private readonly cache = InteractionCache.getInstance();
    private readonly TIMEOUT_MS = 5 * 60 * 1000;
    private readonly EXIT_COMMAND = '!exit';
    private readonly commandRegistry: Record<string, InteractionRegistry> = interactionCommandRegistry;

    private getPromptText(prompt: string | ((data: Record<string, any>) => string), data: Record<string, any>): string {
        return typeof prompt === 'function' ? prompt(data) : prompt;
    }

    private checkForGlobalEndCommand(content: string): boolean {
        return content.trim().toLowerCase() === this.EXIT_COMMAND;
    }

    private handleGlobalEnd(userId: string, messageType: ReceivedMessageType): InteractionResponse {
        this.cache.remove(userId, messageType);
        return {
            message: "Interaction ended.",
            endInteraction: true
        };
    }

    private findStepIndexByName(steps: InteractionStep[], name: string): number {
        return steps.findIndex(step => step.name === name);
    }

    public isUserInteractionExist(user: User, messageType: ReceivedMessageType): boolean {
        const isExist = this.cache.has(user.id, messageType);
        return isExist;
    }

    async processMessage(message: { userId: string; content: string; messageType: ReceivedMessageType }): Promise<InteractionResponse | null> {
        const { userId, content, messageType } = message;

        const state = this.cache.get(userId, messageType);
        if (state) {
            return this.continueInteraction(userId, content, messageType, state);
        }

        const commandName = content.trim().toLowerCase();
        if (this.commandRegistry[commandName]) {
            this.startInteraction(userId, messageType, commandName);
            const command = this.commandRegistry[commandName];
            const firstPrompt = this.getPromptText(command.steps[0].prompt, {});
            return { message: firstPrompt };
        }

        return null;
    }

    private startInteraction(userId: string, messageType: ReceivedMessageType, commandName: string): void {
        this.cache.set(userId, messageType, {
            command: commandName,
            step: 0,
            data: {},
            expireAt: Date.now() + this.TIMEOUT_MS,
        });
    }

    private async continueInteraction(
        userId: string,
        content: string,
        messageType: ReceivedMessageType,
        state: InteractionState
    ): Promise<InteractionResponse> {
        if (this.checkForGlobalEndCommand(content)) {
            return this.handleGlobalEnd(userId, messageType);
        }

        if (this.isInteractionExpired(state)) {
            return this.handleExpiredInteraction(userId, messageType);
        }

        const command = this.commandRegistry[state.command];
        if (!command) {
            return this.handleUnknownCommand(userId, messageType);
        }

        const handlerResult = this.handleCurrentStep(command, state, content);

        if (handlerResult) {
            this.applyHandlerResult(state, handlerResult, command);
        } else {
            state.step++;
        }

        if (this.isInteractionComplete(state, command)) {
            return this.completeInteraction(userId, messageType, state, command);
        }

        this.cache.set(userId, messageType, state);
        const nextPrompt = this.getPromptText(command.steps[state.step].prompt, state.data);
        return { message: nextPrompt };
    }

    private isInteractionExpired(state: InteractionState): boolean {
        return Date.now() > state.expireAt;
    }

    private handleExpiredInteraction(userId: string, messageType: ReceivedMessageType): InteractionResponse {
        this.cache.remove(userId, messageType);
        return { message: "The interaction timed out. Please start over.", endInteraction: true };
    }

    private handleUnknownCommand(userId: string, messageType: ReceivedMessageType): InteractionResponse {
        this.cache.remove(userId, messageType);
        return { message: "Unknown command state.", endInteraction: true };
    }

    private handleCurrentStep(command: InteractionRegistry, state: InteractionState, content: string): HandlerInteractionResult | void {
        const currentStep = command.steps[state.step];
        return currentStep.handler(content, state.data);
    }

    private applyHandlerResult(state: InteractionState, handlerResult: HandlerInteractionResult, command: InteractionRegistry): void {
        if (handlerResult.data) {
            state.data = { ...state.data, ...handlerResult.data };
        }

        if (handlerResult.end) {
            state.step = command.steps.length;
        } else if (handlerResult.nextStep !== undefined) {
            state.step = handlerResult.nextStep;
        } else if (handlerResult.skipTo) {
            const nextStepIndex = this.findStepIndexByName(command.steps, handlerResult.skipTo);
            state.step = nextStepIndex !== -1 ? nextStepIndex : state.step + 1;
        } else {
            state.step++;
        }
    }

    private isInteractionComplete(state: InteractionState, command: InteractionRegistry): boolean {
        return state.step >= command.steps.length;
    }

    private completeInteraction(
        userId: string,
        messageType: ReceivedMessageType,
        state: InteractionState,
        command: InteractionRegistry
    ): InteractionResponse {
        const completionMessage = command.onComplete(state.data);
        this.saveCommand(state.command, state.data);
        this.cache.remove(userId, messageType);
        return { message: completionMessage, endInteraction: true };
    }

    private saveCommand(command: string, data: Record<string, any>): void {
        console.log("Saved command:", { command, data });
    }
}

export default MessageInteractionManager;