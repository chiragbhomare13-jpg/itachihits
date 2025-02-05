export interface InteractionState {
    step: number;
    command: string;
    data: Record<string, any>;
    expireAt: number;
}

export type ReceivedMessageType = "chat" | "message";

export class InteractionCache {
    private static instance: InteractionCache;
    private cache!: Record<string, InteractionState>;

    private constructor() {
        if (InteractionCache.instance) {
            return InteractionCache.instance;
        }
        this.cache = {} as Record<string, InteractionState>;
        InteractionCache.instance = this;
        return this;
    }

    static getInstance(): InteractionCache {
        if (!InteractionCache.instance) {
            InteractionCache.instance = new InteractionCache();
        }
        return InteractionCache.instance;
    }

    /**
     * Sets or updates an interaction state in the cache.
     */
    set(userId: string, messageType: ReceivedMessageType, state: InteractionState): void {
        const key = this.getKey(userId, messageType);
        this.cache[key] = state;
    }

    /**
     * Gets an interaction state from the cache.
     */
    get(userId: string, messageType: ReceivedMessageType): InteractionState | null {
        const key = this.getKey(userId, messageType);
        return this.cache.hasOwnProperty(key) ? this.cache[key] : null;
    }

    /**
     * Checks if an interaction state exists in the cache.
     */
    has(userId: string, messageType: ReceivedMessageType): boolean {
        const key = this.getKey(userId, messageType);
        return this.cache.hasOwnProperty(key);
    }

    /**
     * Removes an interaction state from the cache.
     */
    remove(userId: string, messageType: ReceivedMessageType): void {
        const key = this.getKey(userId, messageType);
        if (this.has(userId, messageType)) {
            delete this.cache[key];
        }
    }

    /**
     * Clears the entire cache.
     */
    clear(): void {
        this.cache = {};
    }

    /**
     * Gets the number of active interaction states in the cache.
     */
    size(): number {
        return Object.keys(this.cache).length;
    }

    /**
     * Generates a unique cache key based on userId and messageType.
     */
    private getKey(userId: string, messageType: ReceivedMessageType): string {
        return `${messageType}:${userId}`;
    }
}

// Exporting the singleton instance
export default InteractionCache.getInstance();
