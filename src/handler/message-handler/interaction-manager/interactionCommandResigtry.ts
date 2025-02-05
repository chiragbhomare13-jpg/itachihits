import { InteractionRegistry } from "../../../interface";
import { getTriggerInteraction } from "./triggerInteractionManager";

export const interactionCommandRegistry: Record<string, InteractionRegistry> = {
    settrigger: getTriggerInteraction(),
}