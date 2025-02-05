import HR, { User, webApi } from "hr-sdk";
import { Permission, SubscriptionType, User as UserModel } from "../interface/models";
import UserRepository from "../repositories/UserRepository";
import CommonConfigService from "./CommonConfigService";
import { getBotInstance, isCreator, isMod, isOwner } from "../utils/utils";
import logger from "../lib/winston";

class UserService {
    private readonly userRepo: UserRepository;
    private readonly commonConfigService: CommonConfigService;
    constructor() {
        this.userRepo = new UserRepository();
        this.commonConfigService = new CommonConfigService();
    }

    async getUser(user: User, bot?: HR) {
        try {
            let userData;
            if (user.id) {
                userData = await this.userRepo.findOne({ userId: user.id });
            } else if (user.username) {
                userData = await this.userRepo.findOne({ username: user.username })
            }
            if (!userData) {
                userData = await this.createDefaultUser(user);
            }
            return userData;
        } catch (error) {
            logger.error("Error Fetching or creating user", { error });
        }
    }

    async createDefaultUser(user: User) {
        let userData;
        if (!user.username) {
            const fetchUsername = await webApi.getUserById(user.id);
            user.username = fetchUsername.username;
        } else if (!user.id) {
            const fetchUserId = await webApi.getUserByUsername(user.username);
            user.id = fetchUserId.userId;
        }

        const bot = getBotInstance();
        const permission: Permission[] = ['user'];
        const mod = await isMod(bot, user);
        const owner = isOwner(user.id);
        const creator = await isCreator(user.id);
        if (mod) permission.push('moderator');
        if (owner) permission.push('owner');
        if (creator) permission.push('creator');
        const payload: UserModel = {
            id: user.id,
            userId: user.id,
            username: user.username,
            permission: permission,
            wallet: 0,
            subscription: {
                subscriptionPlanType: SubscriptionType.FREE,
                isActive: true,
                expiresAt: 0,
                autoRenew: false,
                subscriptionPlanId: "",
            }
        }
        userData = await this.userRepo.create(payload);
        return userData;
    }

    async updateBalanceByUserId(user: User, amount: number, type: 'deposit' | 'deduct'): Promise<number> {
        const fetchUser = await this.getUser(user);
        if (!fetchUser) {
            throw new Error("User not found");
        }
        const balance = fetchUser.wallet;
        let newBalance = 0;
        if (type === 'deduct') {
            if (balance - amount < 0) {
                throw new Error("Insufficient balance");
            }
            newBalance = balance - amount;
            await this.userRepo.update(fetchUser.id, { wallet: newBalance })
        } else if (type === 'deposit') {
            newBalance = balance + amount;
            await this.userRepo.update(fetchUser.id, { wallet: newBalance })
        }
        return newBalance;
    }

    async addPermission(username: string, permissionName: Permission): Promise<Record<string, any>> {
        try {
            const bot = getBotInstance();
            const user: User = { username: username, id: '' };
            const userDetail = await this.getUser(user, bot);
            if (!userDetail || !Array.isArray(userDetail.permission)) return { message: "User not found or permission is corrupted." };
            const isExist = userDetail.permission.find(name => name === permissionName);
            if (isExist) {
                return { message: "User already have this permission." };
            }
            const updatedPermission = [...userDetail.permission, permissionName];
            await this.userRepo.update(userDetail.id, { permission: updatedPermission });
            return { message: "Permission added successfully" };
        } catch (error) {
            logger.error("Error adding permission", { error });
            return { message: "Permission add Failed!" }
        }
    }

    async removePermission(username: string, permissionName: Permission): Promise<Record<string, any>> {
        try {
            const bot = getBotInstance();
            const user: User = { username: username, id: '' };
            const userDetail = await this.getUser(user, bot);
            if (!userDetail || !Array.isArray(userDetail.permission)) return { message: "User not found or permission is corrupted." };
            const isExist = userDetail.permission.find(name => name === permissionName);
            if (!isExist) {
                return { message: "User does not have this permission." };
            }
            const updatedPermission = userDetail.permission.filter(name => name !== permissionName);
            await this.userRepo.update(userDetail.id, { permission: updatedPermission });
            return { message: "Permission removed successfully" };
        } catch (error) {
            logger.error("Error removing permission", { error });
            return { message: "Permission removal failed!" };
        }
    }
}

export default UserService;