import { Options } from "../config/options";
import serverConfig from "../config/server-config";
import { CommonConfig, MessageConfig, MessageScope, MessageType } from "../interface/models";
import CommonConfigRepository from "../repositories/CommonConfigRepository";

class CommonConfigService {
    private readonly repo: CommonConfigRepository;

    constructor() {
        this.repo = new CommonConfigRepository()
    }

    public async getActiveRoomId(): Promise<string> {
        const config = await this.repo.findById(1);
        return config?.activeRoomId ?? "";
    }

    public async updateActiveRoomId(roomId: string): Promise<string | undefined> {
        const update = await this.repo.update(1, { activeRoomId: roomId });
        return update?.activeRoomId;
    }

    public async getCommandPrefix(): Promise<string> {
        const config = await this.getCommonConfig();
        return config?.commandPrefix ?? serverConfig.COMMAND_PREFIX;
    }

    public async setCommandPrefix(prefix: string): Promise<string | undefined> {
        if (prefix.length !== 1) {
            return;
        }
        const update = await this.repo.update(1, { commandPrefix: prefix });
        return update?.commandPrefix;
    }

    public async getMessageConfig(messageType: MessageType): Promise<MessageConfig | undefined> {
        const config = await this.getCommonConfig();
        const response = config?.messageConfig.find(data => data.messageType === messageType);
        return response;
    }

    private async getConfigProperty<T>(key: keyof CommonConfig): Promise<T | undefined> {
        const config = await this.getCommonConfig();
        return config ? (config[key] as T) : undefined;
    }

    public async getCreatorId(): Promise<string | null> {
        const config = await this.getCommonConfig();
        let creatorId = config?.creatorId;
        if (!creatorId) {
            creatorId = Options.CREATOR_ID
        }
        return creatorId;
    }

    public async getAnyProperty<T>(key: keyof CommonConfig): Promise<T | undefined> {
        return this.getConfigProperty<T>(key);
    }

    public async getCommonConfig(): Promise<CommonConfig | null> {
        return await this.repo.findById(1);
    }

    public async findAll() {
        const allConfigs = await this.repo.findAll();
        return allConfigs;
    }

    public async create(configPayload: CommonConfig) {
        const newConfig = await this.repo.create(configPayload);
        return newConfig;
    }

    private generateDefaultConfig(): CommonConfig {
        return {
            id: 1,
            activeRoomId: serverConfig.ROOM_ID,
            messageConfig: Object.values(MessageType).map(type => ({
                messageScope: MessageScope.GLOBAL,
                messageType: type
            })),
            highriseTokenId: serverConfig.HIGHRISE_TOKEN,
            commandPrefix: serverConfig.COMMAND_PREFIX,
            creatorId: Options.CREATOR_ID,
        }
    }

    /**
     * @description Merges the existing config with the default config.
     * Adds missing fields and retains existing ones.
     */
    private mergeConfig(existingConfig: CommonConfig, defaultConfig: CommonConfig): CommonConfig {
        return {
            ...defaultConfig,
            ...existingConfig,
            messageConfig: defaultConfig.messageConfig.map((defaultMessage) => {
                const existingMessageConfig = existingConfig.messageConfig || []; // Ensure it's an array
                const existingMessage = existingMessageConfig.find(
                    msg => msg.messageType === defaultMessage.messageType
                );
                return existingMessage ?? defaultMessage;
            }),
        };
    }


    /**
     * @description Ensures the configuration with ID 1 exists and is up-to-date.
     */
    public async initializeConfig(): Promise<CommonConfig> {
        const defaultConfig = this.generateDefaultConfig();
        const existingConfig = await this.repo.findById(1);

        if (existingConfig) {
            const mergedConfig = this.mergeConfig(existingConfig, defaultConfig);

            // Only update if there's a difference
            if (JSON.stringify(existingConfig) !== JSON.stringify(mergedConfig)) {
                await this.repo.update(1, mergedConfig);
            }
            return mergedConfig;
        } else {
            await this.repo.create(defaultConfig);
            return defaultConfig;
        }
    }
}

export default CommonConfigService;