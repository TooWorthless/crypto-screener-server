import WebSocket from 'ws';
import { config } from './config';
import { WebSocketService } from './services/websocketService';

export const wss = new WebSocket.Server({ port: config.wsPort });
export const wsService = new WebSocketService(wss);

wsService.initialize();
console.log(`WebSocket server running on port ${config.wsPort}`);