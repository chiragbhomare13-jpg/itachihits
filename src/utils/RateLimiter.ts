class RateLimiter {
    private static instance: RateLimiter | null = null;
    private readonly userRequests: Map<string, number[]>;
    private readonly maxRequests: number;
    private readonly timeWindow: number;
    private readonly exemptCommands: Set<string>;

    private constructor(maxRequests: number = 3, timeWindow: number = 30) {
        this.userRequests = new Map();
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.exemptCommands = new Set(['hello']);
    }

    public static getInstance(maxRequests: number = 3, timeWindow: number = 30): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter(maxRequests, timeWindow);
        }
        return RateLimiter.instance;
    }

    public static resetInstance(): void {
        RateLimiter.instance = null;
    }

    isAllowed(userId: string, command: string): boolean {
        if (this.exemptCommands.has(command.toLowerCase())) {
            return true;
        }

        const currentTime = Date.now() / 1000;
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
