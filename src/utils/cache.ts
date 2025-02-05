import { CacheKey } from "./constant";

class HRCache<T = any> {
    private static instance: HRCache;
    private cache!: Record<CacheKey, T>;

    constructor() {
        if (HRCache.instance) {
            return HRCache.instance;
        }
        this.cache = {} as Record<CacheKey, T>;
        HRCache.instance = this;
        return this;
    }

    set(key: CacheKey, value: T): void {
        this.cache[key] = value;
    }

    get(key: CacheKey): T | null {
        return this.cache.hasOwnProperty(key) ? this.cache[key] : null;
    }

    has(key: CacheKey): boolean {
        return this.cache.hasOwnProperty(key);
    }

    update(key: CacheKey, value: T): void {
        if (this.has(key)) {
            this.cache[key] = value;
        } else {
            console.warn(`Key "${key}" does not exist in the cache.`);
        }
    }

    remove(key: CacheKey): void {
        if (this.has(key)) {
            delete this.cache[key];
        } else {
            console.warn(`Key "${key}" does not exist in the cache.`);
        }
    }

    clear(): void {
        this.cache = {} as Record<CacheKey, T>;
    }

    size(): number {
        return Object.keys(this.cache).length;
    }
}

// Exporting the singleton instance
const hrCache = new HRCache();
export default hrCache;
