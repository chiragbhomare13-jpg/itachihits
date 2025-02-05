class RateLimiter {
    private readonly userRequests: Map<string, number[]>;
    private readonly maxRequests: number;
    private readonly timeWindow: number;
    private readonly exemptCommands: Set<string>;

    constructor(maxRequests: number = 10, timeWindow: number = 10) {
        this.userRequests = new Map();
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.exemptCommands = new Set(['hello']);
    }

    isAllowed(userId: string, command: string): boolean {
        if (this.exemptCommands.has(command.toLowerCase())) {
            return true;
        }

        const currentTime = Date.now() / 1000; // Current time in seconds
        const userRequestTimes = this.userRequests.get(userId) || [];

        const recentRequests = userRequestTimes.filter(
            timestamp => currentTime - timestamp <= this.timeWindow
        );

        if (recentRequests.length >= this.maxRequests) {
            return false;
        }

        recentRequests.push(currentTime);
        this.userRequests.set(userId, recentRequests);

        return true;
    }

    addExemptCommand(command: string): void {
        this.exemptCommands.add(command.toLowerCase());
    }

    removeExemptCommand(command: string): void {
        this.exemptCommands.delete(command.toLowerCase());
    }
}

export default RateLimiter;