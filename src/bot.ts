import { HR, Event, ChatEvent, PlayerLeftEvent, PlayerJoinedEvent, ReadyEvent, PlayerMovedEvent, MessageEvent, TipEvent } from 'hr-sdk';
import ReadyHandler from './handler/ready-handler';
import ChatHandler from './handler/chat-handler';
import PlayerJoinedHandler from './handler/player-joined-handler';
import PlayerLeftHandler from './handler/player-left-handler';
import PlayerMovementHandler from './handler/player-movement-handler';
import MessageHandler from './handler/message-handler';
import logger from './lib/winston';
import hrCache from './utils/cache';
import TipHandler from './handler/tip-handler';

const bot = new HR();
hrCache.set('bot', bot);

/**
 * @description It will be called when bot is ready.
 * @param {ReadyEvent} data
 */
bot.on(Event.Ready, (data: ReadyEvent) => new ReadyHandler(bot, data));

/**
 * @description It will be called when chat message is send to the room
 * @param {ChatEvent} data
 */
bot.on(Event.Chat, (data: ChatEvent) => new ChatHandler(bot, data));

/**
 * @description It will be called when user joins a room.
 * @param {PlayerJoinedEvent} data
 */
bot.on(Event.PlayerJoin, (data: PlayerJoinedEvent) => new PlayerJoinedHandler(bot, data));

/**
 * @description It will be called when user leaves a room.
 * @param {PlayerLeftEvent} data
 */
bot.on(Event.PlayerLeft, (data: PlayerLeftEvent) => new PlayerLeftHandler(bot, data));

/**
 * @description It will be called when bot moves.
 * @param {PlayerMovedEvent} data
 */
bot.on(Event.PlayerMovement, (data: PlayerMovedEvent) => new PlayerMovementHandler(bot, data));

/**
 * @description It will be called when bot receives message.
 * @param {MessageEvent} data
 */
bot.on(Event.Message, (data: MessageEvent) => new MessageHandler(bot, data));

/**
 * @description It will be called when bot receives the tip.
 * @param {MessageEvent} data
 */
bot.on(Event.Tip, (data: TipEvent) => new TipHandler(bot, data));

/**
 * @description It will be called when encounters an error.
 * @param {Error} error
 */
bot.on(Event.Error, (error: any) => {
    logger.error("Error Generated in bot file", { error })
});

export default bot;