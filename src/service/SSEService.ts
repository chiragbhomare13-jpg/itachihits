import { EventSource } from 'eventsource';
import logger from '../lib/winston';
import { sendChat } from './bot/botHelper';
import { getRandomFromArray } from '../utils/utils';
import { musicVibeMessage } from '../utils/store';

interface SongData {
    title: string;
    requestedBy: string;
    artist?: string;
    duration?: string;
}

// Define all possible event types
type EventTypes = {
    'newSong': SongData;
    'heartbeat': { timestamp: number };
    [key: string]: any;
};

export class SSEService {
    private eventSource!: EventSource;
    private isConnected: boolean = false;
    private readonly url: string;
    private readonly eventHandlers: Map<keyof EventTypes, ((data: any) => void)[]> = new Map();
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 5;
    private readonly initialReconnectDelay: number = 5000;
    private readonly retryAfterFailure: number = 30 * 60 * 1000;
    private readonly heartbeatTimeout: number = 20 * 1000;
    private reconnectTimeout?: NodeJS.Timeout;
    private retryTimeout?: NodeJS.Timeout;
    private heartbeatTimeoutId?: NodeJS.Timeout;
    private isHandlingError: boolean = false;

    constructor(url: string) {
        this.url = url;
    }

    /**
     * Add an event listener for a specific event type
     */
    public on<K extends keyof EventTypes>(
        eventName: K,
        callback: (data: EventTypes[K]) => void
    ): void {
        const handlers = this.eventHandlers.get(eventName) || [];
        handlers.push(callback);
        this.eventHandlers.set(eventName, handlers);

        // If already connected, add the event listener
        if (this.isConnected && this.eventSource) {
            this.addEventSourceListener(eventName);
        }
    }

    /**
     * Remove an event listener
     */
    public off<K extends keyof EventTypes>(
        eventName: K,
        callback: (data: EventTypes[K]) => void
    ): void {
        const handlers = this.eventHandlers.get(eventName) || [];
        const index = handlers.indexOf(callback);
        if (index > -1) {
            handlers.splice(index, 1);
            this.eventHandlers.set(eventName, handlers);
        }
    }

    /**
     * Connect to the SSE server and setup all registered event listeners
     */
    public connect(): void {
        this.setupSSE();
    }

    public disconnect(): void {
        this.cleanupSSE();
    }

    private resetHeartbeatTimeout(): void {
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
        }
        
        this.heartbeatTimeoutId = setTimeout(() => {
            logger.warn('No heartbeat received for 20 seconds, reconnecting...');
            this.handleConnectionError();
        }, this.heartbeatTimeout);
    }

    private cleanupSSE(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = undefined;
        }
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = undefined;
        }
        
        if (this.eventSource) {
            this.eventSource.close();
            this.isConnected = false;
            this.isHandlingError = false;
            logger.info('SSE Connection closed');
        }
    }

    private addEventSourceListener<K extends keyof EventTypes>(eventName: K): void {
        this.eventSource.addEventListener(eventName as string, async (event: any) => {
            try {
                // Reset heartbeat timeout on any event
                this.resetHeartbeatTimeout();
                
                if (eventName === 'heartbeat') {
                    return;
                }

                // Parse the event data if it's a string, otherwise use it as is
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                const handlers = this.eventHandlers.get(eventName) || [];
                
                handlers.forEach(handler => {
                    try {
                        handler(data);
                    } catch (error) {
                        logger.error(`Error in handler for event ${String(eventName)}:`, error);
                    }
                });
            } catch (error) {
                logger.error(`Error handling SSE ${String(eventName)} event:`, error);
            }
        });
    }

    private setupSSE(): void {
        try {
            this.cleanupSSE();
            
            this.eventSource = new (EventSource as any)(this.url);
            
            // Start heartbeat timeout as soon as we create the connection
            this.resetHeartbeatTimeout();
            
            this.eventSource.onopen = () => {
                logger.info(`SSE Connection established to ${this.url}`);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.isHandlingError = false;
                
                this.resetHeartbeatTimeout();
                
                if (this.retryTimeout) {
                    clearTimeout(this.retryTimeout);
                    this.retryTimeout = undefined;
                }
                
                // Setup all registered event listeners
                for (const eventName of this.eventHandlers.keys()) {
                    this.addEventSourceListener(eventName);
                }

                // Add heartbeat listener
                this.addEventSourceListener('heartbeat');
            };

            this.eventSource.onerror = (error) => {
                if (!this.isHandlingError) {
                    logger.error('SSE Connection Error:', error);
                    this.handleConnectionError();
                }
            };

        } catch (error) {
            if (!this.isHandlingError) {
                logger.error('Error setting up SSE connection:', error);
                this.handleConnectionError();
            }
        }
    }

    private getReconnectDelay(): number {
        return this.initialReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    }

    private handleConnectionError(): void {
        if (this.isHandlingError) return;
        
        this.isHandlingError = true;
        this.isConnected = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.getReconnectDelay();
            logger.info(`Reconnect attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts} in ${delay/1000} seconds`);
            
            this.reconnectTimeout = setTimeout(() => {
                this.isHandlingError = false;
                if (!this.isConnected) {
                    this.setupSSE();
                }
            }, delay);
        } else {
            logger.error('Max reconnection attempts reached. Will try again in 30 minutes.');
            
            this.retryTimeout = setTimeout(() => {
                logger.info('Attempting to reconnect after 30 minute cooldown...');
                this.reconnectAttempts = 0;
                this.isHandlingError = false;
                this.setupSSE();
            }, this.retryAfterFailure);
        }
    }

    public isConnectedToServer(): boolean {
        return this.isConnected;
    }

    /**
     * Initialize SSE with default event handlers
     */
    public initializeSSE(): void {
        logger.info('Setting up newSong event handler');
        this.on('newSong', (songData: SongData) => {
            sendChat(`\n╰┈➤ 🎶🎶Incoming Song🎶🎶  \n\n🎧 Song Name: 「 ✦ ${songData.title} ✦ 」\n\n🕣 • ılıılıılıılıılıılı • ${songData.duration}\n\n\n🧟Requested By: @${songData.requestedBy}\n\n${getRandomFromArray(musicVibeMessage)}`);
        });
        logger.info('Connecting to SSE server...');
        this.connect();
    }
}

export default SSEService;
