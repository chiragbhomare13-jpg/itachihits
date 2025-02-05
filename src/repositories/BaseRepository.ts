import Loki from 'lokijs';
import { IBaseItem } from '../interface/models';
import path from "node:path";
import fs from "node:fs";
import hrCache from '../utils/cache';
import { cacheKey } from '../utils/constant';

class BaseRepository<T extends IBaseItem> {
    private readonly db: Loki;
    protected collection!: Collection<T>;
    private readonly initPromise: Promise<void>;

    constructor(collectionName: string, filename: string = 'database.db', isRoomSpecific = false) {
        // Ensure database files are always created in dist/db regardless of where the code is running from
        let roomId = '';
        if (isRoomSpecific) {
            roomId = hrCache.get(cacheKey.roomId);
        }
        const dirPath = path.join(process.cwd(), 'dist', 'db', roomId);
        const filePath = path.join(dirPath, filename);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        this.db = new Loki(filePath);
        this.initPromise = new Promise((resolve) => {
            this.db.loadDatabase({}, () => {
                this.collection = this.db.getCollection<T>(collectionName);
                if (this.collection === null) {
                    this.collection = this.db.addCollection<T>(collectionName);
                }
                resolve();
            });
        });
    }

    protected async ensureInitialized(): Promise<void> {
        await this.initPromise;
    }

    /**
     * @description Create new item
     * @param item 
     */
    async create(item: T): Promise<T | null> {
        await this.ensureInitialized();
        const find = await this.findById(item.id);
        if (find) {
            throw new Error(`Item with id ${item.id} already exists`);
        }
        const response = this.collection.insert(item);
        this.db.saveDatabase();
        return response ?? null;
    }

    /**
     * @description Create multiple items
     * @param items 
     */
    async createMany(items: T[]): Promise<T[]> {
        await this.ensureInitialized();
        const response = this.collection.insert(items) ?? [];
        this.db.saveDatabase();
        return response;
    }

    /**
     * @description Get all items
     */
    async findAll(): Promise<T[]> {
        await this.ensureInitialized();
        return this.collection.find() ?? [];
    }

    /**
     * @description Get item by id
     * @param id 
     */
    async findById(id: string | number): Promise<T | null> {
        await this.ensureInitialized();
        return this.collection.findOne({ id: id } as any);
    }

    /**
     * @description Update item by id
     * @param id 
     * @param updatedItem 
     */
    async update(id: string | number, updatedItem: Partial<T>): Promise<T | null> {
        await this.ensureInitialized();
        const item = this.collection.findOne({ id: id } as any);
        if (item) {
            Object.assign(item, updatedItem);
            this.collection.update(item);
            this.db.saveDatabase();
            return item;
        }
        return null;
    }

    /**
     * @description Find items by query
     * @param query 
     */
    async find(query: LokiQuery<T & LokiObj>): Promise<T[]> {
        await this.ensureInitialized();
        return this.collection.find(query) ?? [];
    }

    /**
     * @description Find one item by query
     * @param query 
     */
    async findOne(query: LokiQuery<T & LokiObj>): Promise<T | null> {
        await this.ensureInitialized();
        return this.collection.findOne(query) ?? null;
    }

    /**
     * @description Delete item by id
     * @param id 
     */
    async delete(id: string | number): Promise<T | null> {
        await this.ensureInitialized();
        const item = this.findById(id);
        if (!item) {
            throw new Error(`Item with ${id} does not exist`);
        }
        return this.collection.remove({ id: id } as any);
    }
}

export default BaseRepository;
