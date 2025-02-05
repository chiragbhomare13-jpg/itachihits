import { InteractionRegistry, InteractionStep } from "../../../interface";
import { commonInteractionWrapper } from "./commonWrapper";

export function getTriggerInteraction(): InteractionRegistry {
    return {
        steps: getAllSteps(),
        onComplete: onComplete
    }
}

function getAllSteps(): InteractionStep[] {
    return [
        getStepOne(),
        getSetupTwo(),
        getStepThree(),
    ]
}

function onComplete(data: Record<string, any>): string {
    return `Trigger set successfully!\nTrigger: "${data.trigger}"\nResponse: "${data.response}"`;
}

function getStepOne(): InteractionStep {
    return {
        name: '1',
        prompt: "1. What message should trigger the bot?",
        handler: commonInteractionWrapper((input: any, data: any) => {
            data.trigger = input;
        }),
    }
}

function getSetupTwo(): InteractionStep {
    return {
        name: '2',
        prompt: (data) => `2. Are you sure you want to use "${data.trigger}" as the trigger? (yes/no)`,
        handler: commonInteractionWrapper((input: any, data: any) => {
            if (input.toLowerCase() === 'no') {
                return { nextStep: 0 };
            }
        }),
    }
}

function getStepThree(): InteractionStep {
    return {
        name: '3',
        prompt: (data) => `3. What should the bot respond with when someone says "${data.trigger}"?`,
        handler: commonInteractionWrapper((input: any, data: any) => {
            data.response = input;
        }),
    }
}