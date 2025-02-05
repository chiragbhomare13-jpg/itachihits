import { User } from "../interface/models";
import { models } from "./dbDataConfig";
import BaseRepository from "./BaseRepository";

class UserRepository extends BaseRepository<User> {
    constructor() {
        super(models.User.name, models.User.dbPath, models.User.isRoomSpecific);
    }

    async findByRoomIdAndUsername(username: string): Promise<User | null> {
        await this.ensureInitialized();
        const user = await this.collection.findOne({username: username });
        return user;
    }

    async findByRoomIdAndUserId(userId: string): Promise<User | null> {
        await this.ensureInitialized();
        const user = await this.collection.findOne({userId: userId });
        return user;
    }
}

export default UserRepository;