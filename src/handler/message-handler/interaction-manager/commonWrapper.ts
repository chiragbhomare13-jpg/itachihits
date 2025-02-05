import { HandlerInteractionResult } from "../../../interface";

export function handleCommonCommands(input: string): HandlerInteractionResult | null {
    const command = input.split(' ')[0].toLowerCase();
    let skipNumber;
    if (command.startsWith("!skip")) {
        const number = parseInt(input.split(' ')[1]);
        if (isNaN(number)) {
            return null;
        }
        skipNumber = number;
    }
    switch (command) {
        case '!skip':
            return { skipTo: skipNumber?.toString() };
        case '!end':
            return { end: true };
        default:
            return null;
    }
}

export function commonInteractionWrapper(
    handler: (input: any, data: any) => any
): (input: any, data: any) => HandlerInteractionResult | void {
    return (input: any, data: any) => {
        const commonResult = handleCommonCommands(input);
        if (commonResult) {
            return commonResult;
        }
        return handler(input, data);
    };
}