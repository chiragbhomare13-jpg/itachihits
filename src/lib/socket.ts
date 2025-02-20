import { io, Socket } from 'socket.io-client';
import logger from './winston';
import { sendChat } from '../service/bot/botHelper';
import { getRandomFromArray } from '../utils/utils';
import { musicVibeMessage } from '../utils/store';
import { percentToSeekbar } from '../utils/progressBar';

interface BufferHeader {
    type: string;
    size?: number;
    format?: string;
}

interface StreamPacket {
    data: any;
    timestamp: number;
}

class SocketClient {
    private readonly socket: Socket;
    private isConnected: boolean;

    constructor(serverUrl = 'http://localhost:9126') {
        this.socket = io(serverUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });
        this.isConnected = false;
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            logger.info('Connected to server');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            logger.info('Disconnected from server');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error: Error) => {
            logger.error('Connection error:', error);
            this.isConnected = false;
        });

        // Handle server ping
        this.socket.on('ping', () => {
            this.socket.emit('pong');
        });

        // Streaming events
        this.socket.on('newSong', (songDetail: any) => {
            sendChat(`\n╰┈➤ 🎶🎶Song Cooking🎶🎶  \n\n🎧 Song Name: 「 ✦ ${songDetail.title} ✦ 」\n\n🕣 • ılıılıılıılıılıılı • ${songDetail.duration}\n\n\n🧟Requested By: @${songDetail.requestedBy}\n\n${getRandomFromArray(musicVibeMessage)}`);
        });

        // playbackProgress
        this.socket.on('playbackProgress', (playbackDetail: any) => {
            sendChat(`\n╰┈➤ 🎶🎶Time elapsed🎶🎶 \n\nlıllılı.ıllı.ılılı.ılıllılı.ıllı.ılılıı\n${playbackDetail.elapsed} ${percentToSeekbar(playbackDetail.percent)} ${playbackDetail.total}`);
        });

        this.socket.on('bufferHeader', (header: BufferHeader) => {
            logger.debug('Received buffer header:', header);
        });

        this.socket.on('stream', (packet: StreamPacket) => {
            logger.debug('Received stream packet');
        });

        logger.info("Socket events initialized");
    }

    // Get connection status
    isSocketConnected(): boolean {
        return this.isConnected;
    }

    // Cleanup method
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default SocketClient;
