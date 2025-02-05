interface SplitMessageOptions {
    maxLength?: number;
    preserveWords?: boolean;
}

export class MessageSplitter {
    /**
     * Splits a message into chunks respecting sentence and word boundaries
     * @param message The message to split
     * @param options Configuration options
     * @returns Array of message chunks
     */
    static splitMessage(message: string, options: SplitMessageOptions = {}): string[] {
        const {
            maxLength = 250,
            preserveWords = true
        } = options;

        if (!message || message.length <= maxLength) {
            return [message];
        }

        const chunks: string[] = [];
        let remainingMessage = message;

        while (remainingMessage.length > 0) {
            if (remainingMessage.length <= maxLength) {
                chunks.push(remainingMessage);
                break;
            }

            let splitIndex = maxLength;

            const lastSentenceEnd = remainingMessage
                .substring(0, maxLength)
                .lastIndexOf('.');
            
            if (lastSentenceEnd > 0) {
                splitIndex = lastSentenceEnd + 1;
            } else if (preserveWords) {
                const lastSpace = remainingMessage
                    .substring(0, maxLength)
                    .lastIndexOf(' ');
                
                if (lastSpace > 0) {
                    splitIndex = lastSpace;
                }
            }

            const chunk = remainingMessage
                .substring(0, splitIndex)
                .trim();
            
            if (chunk) {
                chunks.push(chunk);
            }

            remainingMessage = remainingMessage
                .substring(splitIndex)
                .trim();
        }

        return chunks;
    }
}