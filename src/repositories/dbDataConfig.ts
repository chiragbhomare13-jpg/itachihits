import { DbModel } from "../interface";

export const models: DbModel = {
    Emote: {
        name: "emotes",
        dbPath: "emotes.db",
        isRoomSpecific: false
    },
    CommonConfig: {
        name: "commonConfigs",
        dbPath: "commonConfigs.db",
        isRoomSpecific: false
    },
    User: {
        name: "users",
        dbPath: "users.db",
        isRoomSpecific: false
    },
    SchedulerConfig: {
        name: "schedulerConfigs",
        dbPath: "schedulerConfigs.db",
        isRoomSpecific: false
    },
    RoomConfig: {
        name: "roomConfigs",
        dbPath: "roomConfigs.db",
        isRoomSpecific: true
    },
    CommandConfig: {
        name: "commandConfigs",
        dbPath: "commandConfigs.db",
        isRoomSpecific: false
    },
    MessageStore: {
        name: "messageStores",
        dbPath: "messageStores.db",
        isRoomSpecific: false
    },
    BasePermissionsConfig: {
        name: "basePermissionsConfigs",
        dbPath: "basePermissionsConfigs.db",
        isRoomSpecific: false
    }
}