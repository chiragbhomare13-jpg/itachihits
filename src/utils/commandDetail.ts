import { ChatCommandStringUnion, HelpCommand} from "../interface";
import { ChatCommand } from "../interface/models";

export const chatCommandDefaultConf: Record<ChatCommandStringUnion, HelpCommand & Partial<ChatCommand>> = {
    // Basic Commands
    "hello": {
        short: "",
        alias: [],
        description: "Say hello to the bot",
        usage: ["hello"],
        examples: ["hello"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'hello']
    },
    "help": {
        short: "",
        alias: ["h"],
        description: "Display all available commands",
        usage: ["help [command]"],
        examples: ["help", "help hello", "help follow"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'help']
    },
    "h": {
        short: "",
        alias: ["h"],
        description: "Display all available commands",
        usage: ["help [command]"],
        examples: ["help", "help hello", "help follow"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'help']
    },

    // User Management
    "follow": {
        short: "f",
        alias: ["f"],
        description: "Follow a user to get notifications when they join the room",
        usage: ["follow <username>"],
        examples: ["follow JohnDoe", "f JaneDoe"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'follow']
    },
    "unfollow": {
        short: "uf",
        alias: ["uf"],
        description: "Stop following a user",
        usage: ["unfollow <username>"],
        examples: ["unfollow JohnDoe", "uf JaneDoe"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'unfollow']
    },

    // Room Management
    "relocate": {
        short: "rl",
        alias: ["rl"],
        description: "Move bot to a specific location in the room",
        usage: ["relocate <x> <y>"],
        examples: ["relocate 5 10", "rl 15 20"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'relocate']
    },
    "set": {
        short: "",
        alias: [],
        description: "Configure room settings",
        usage: ["set <setting> <value>"],
        examples: ["set volume 50", "set autoplay true"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'set']
    },

    // Music Queue Management
    "add": {
        short: "a",
        alias: ["a"],
        description: "Add a song to the music queue",
        usage: ["add <song_name>", "add <song_url>"],
        examples: ["add Shape of You", "a https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'add']
    },
    "unadd": {
        short: "ua",
        alias: ["ua"],
        description: "Remove a song from the music queue",
        usage: ["unadd <song_number>"],
        examples: ["unadd 1", "ua 3"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'unadd']
    },
    "allow": {
        short: "",
        alias: [],
        description: "Allow a user to add songs to the queue",
        usage: ["allow <username>"],
        examples: ["allow JohnDoe"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'allow']
    },
    "unallow": {
        short: "",
        alias: [],
        description: "Remove a user's permission to add songs",
        usage: ["unallow <username>"],
        examples: ["unallow JohnDoe"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'unallow']
    },
    "enable": {
        short: "en",
        alias: ["en"],
        description: "Enable a feature or setting",
        usage: ["enable <feature>"],
        examples: ["enable autoplay"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator'],
        assignableBy: ["creator"]
    },
    "disable": {
        short: "dis",
        alias: ["dis"],
        description: "Disable a feature or setting",
        usage: ["disable <feature>"],
        examples: ["disable autoplay"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator']
    },

    // Playback Commands
    "play": {
        short: "p",
        alias: ["p"],
        description: "Play a song",
        usage: ["play <song_name>", "play <song_url>"],
        examples: ["play Despacito", "p https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'play']
    },
    "p": {
        short: "",
        alias: [],
        description: "Alias for play command",
        usage: ["p <song_name>", "p <song_url>"],
        examples: ["p Despacito", "p https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'play']
    },
    "previous": {
        short: "",
        alias: [],
        description: "Alias for play command",
        usage: ["p <song_name>", "p <song_url>"],
        examples: ["p Despacito", "p https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'play']
    },
    "prev": {
        short: "",
        alias: [],
        description: "Alias for play command",
        usage: ["p <song_name>", "p <song_url>"],
        examples: ["p Despacito", "p https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'play']
    },
    "fplay": {
        short: "fp",
        alias: ["fp"],
        description: "Force play a song (skips current song)",
        usage: ["fplay <song_name>", "fplay <song_url>"],
        examples: ["fplay Despacito", "fp https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'fplay']
    },
    "fp": {
        short: "",
        alias: [],
        description: "Alias for fplay command",
        usage: ["fp <song_name>", "fp <song_url>"],
        examples: ["fp Despacito", "fp https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'fplay']
    },
    "playyt": {
        short: "pyt",
        alias: ["pyt"],
        description: "Play a song from YouTube",
        usage: ["playyt <song_name>", "playyt <youtube_url>"],
        examples: ["playyt Despacito", "pyt https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playyt']
    },
    "pyt": {
        short: "",
        alias: [],
        description: "Alias for playyt command",
        usage: ["pyt <song_name>", "pyt <youtube_url>"],
        examples: ["pyt Despacito", "pyt https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playyt']
    },
    "playsc": {
        short: "psc",
        alias: ["psc"],
        description: "Play a song from SoundCloud",
        usage: ["playsc <song_name>", "playsc <soundcloud_url>"],
        examples: ["playsc Despacito", "psc https://soundcloud.com/..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playsc']
    },
    "psc": {
        short: "",
        alias: [],
        description: "Alias for playsc command",
        usage: ["psc <song_name>", "psc <soundcloud_url>"],
        examples: ["psc Despacito", "psc https://soundcloud.com/..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playsc']
    },
    "playjio": {
        short: "pjio",
        alias: ["pjio"],
        description: "Play a song from JioSaavn",
        usage: ["playjio <song_name>", "playjio <jiosaavn_url>"],
        examples: ["playjio Despacito", "pjio https://jiosaavn.com/..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playjio']
    },
    "pjio": {
        short: "",
        alias: [],
        description: "Alias for playjio command",
        usage: ["pjio <song_name>", "pjio <jiosaavn_url>"],
        examples: ["pjio Despacito", "pjio https://jiosaavn.com/..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playjio']
    },
    "playtop": {
        short: "ptop",
        alias: ["ptop"],
        description: "Add a song to the top of the queue",
        usage: ["playtop <song_name>", "playtop <song_url>"],
        examples: ["playtop Despacito", "ptop https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'playtop']
    },
    "ptop": {
        short: "",
        alias: [],
        description: "Alias for playtop command",
        usage: ["ptop <song_name>", "ptop <song_url>"],
        examples: ["ptop Despacito", "ptop https://youtube.com/watch?v=..."],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'playtop']
    },
    "playfav": {
        short: "pfav",
        alias: ["pfav"],
        description: "Play a song from your favorites",
        usage: ["playfav <number>"],
        examples: ["playfav 1", "pfav 3"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playfav']
    },
    "pfav": {
        short: "",
        alias: [],
        description: "Alias for playfav command",
        usage: ["pfav <number>"],
        examples: ["pfav 1", "pfav 3"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'playfav']
    },

    // Queue Control
    "queue": {
        short: "q",
        alias: ["q"],
        description: "Show the current music queue",
        usage: ["queue [page]"],
        examples: ["queue", "q 2"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'queue']
    },
    "q": {
        short: "",
        alias: [],
        description: "Alias for queue command",
        usage: ["q [page]"],
        examples: ["q", "q 2"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'queue']
    },
    "skip": {
        short: "s",
        alias: ["s"],
        description: "Skip the current song",
        usage: ["skip"],
        examples: ["skip"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'skip']
    },
    "fskip": {
        short: "fs",
        alias: ["fs"],
        description: "Force skip the current song",
        usage: ["fskip"],
        examples: ["fskip"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'fskip']
    },
    "now": {
        short: "np",
        alias: ["np"],
        description: "Show currently playing song",
        usage: ["now"],
        examples: ["now", "np"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'now']
    },
    "np": {
        short: "",
        alias: [],
        description: "Alias for now command",
        usage: ["np"],
        examples: ["np"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'now']
    },
    "next": {
        short: "n",
        alias: ["n"],
        description: "Show the next song in queue",
        usage: ["next"],
        examples: ["next", "n"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'next']
    },
    "undo": {
        short: "",
        alias: [],
        description: "Remove the last added song from queue",
        usage: ["undo"],
        examples: ["undo"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'undo']
    },
    "fundo": {
        short: "",
        alias: [],
        description: "Force remove the last added song",
        usage: ["fundo"],
        examples: ["fundo"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'fundo']
    },
    "drop": {
        short: "",
        alias: [],
        description: "Remove a specific song from queue",
        usage: ["drop <number>"],
        examples: ["drop 3"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'drop']
    },
    "dequeue": {
        short: "dq",
        alias: ["dq"],
        description: "Clear the entire music queue",
        usage: ["dequeue"],
        examples: ["dequeue", "dq"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dequeue']
    },

    // Favorites Management
    "fav": {
        short: "",
        alias: [],
        description: "Add current song to favorites",
        usage: ["fav"],
        examples: ["fav"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'fav']
    },
    "pin": {
        short: "",
        alias: [],
        description: "Pin current song to your list",
        usage: ["pin"],
        examples: ["pin"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'pin']
    },
    "unfav": {
        short: "",
        alias: [],
        description: "Remove a song from favorites",
        usage: ["unfav <number>"],
        examples: ["unfav 2"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'unfav']
    },
    "unpin": {
        short: "",
        alias: [],
        description: "Unpin a song from your list",
        usage: ["unpin <number>"],
        examples: ["unpin 3"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'dj', 'unpin']
    },
    "favlist": {
        short: "fl",
        alias: ["fl"],
        description: "Show your favorite songs",
        usage: ["favlist [page]"],
        examples: ["favlist", "fl 2"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'favlist']
    },
    "pinlist": {
        short: "pl",
        alias: ["pl"],
        description: "Show your pinned songs",
        usage: ["pinlist [page]"],
        examples: ["pinlist", "pl 2"],
        canExecute: true,
        requirePermission: false,
        allowedPermission: ['creator', 'owner', 'user', 'pinlist']
    },

    // Ban Management
    "ban": {
        short: "",
        alias: [],
        description: "Ban a user by their ID",
        usage: ["ban <user_id>"],
        examples: ["ban 123456"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'ban']
    },
    "banname": {
        short: "",
        alias: [],
        description: "Ban a user by their username",
        usage: ["banname <username>"],
        examples: ["banname JohnDoe"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'banname']
    },
    "banlist": {
        short: "bl",
        alias: ["bl"],
        description: "Show list of banned users",
        usage: ["banlist [page]"],
        examples: ["banlist", "bl 2"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'banlist']
    },
    "unbanat": {
        short: "",
        alias: [],
        description: "Unban a user at specific position in ban list",
        usage: ["unbanat <position>"],
        examples: ["unbanat 3"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'unbanat']
    },
    "unbanname": {
        short: "",
        alias: [],
        description: "Unban a user by their username",
        usage: ["unbanname <username>"],
        examples: ["unbanname JohnDoe"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'unbanname']
    },
    "unbanall": {
        short: "",
        alias: [],
        description: "Remove all users from ban list",
        usage: ["unbanall"],
        examples: ["unbanall"],
        canExecute: true,
        requirePermission: true,
        allowedPermission: ['creator', 'owner', 'moderator', 'unbanall']
    }
}
