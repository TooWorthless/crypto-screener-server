import WebSocket from 'ws';
import { verifyToken } from '../utils/jwt';

interface ExtendedWebSocket extends WebSocket {
    userId?: string;
  }

export class WebSocketService {
  private wss: WebSocket.Server;

  constructor(wss: WebSocket.Server) {
    this.wss = wss;
  }

  initialize() {
    this.wss.on('connection', (ws: ExtendedWebSocket, req) => {
      const token = new URLSearchParams(req.url?.split('?')[1]).get('token');
      try {
        const decoded = verifyToken(token || '');
        ws.userId = decoded.id;
        ws.send(JSON.stringify({ type: 'connected', userId: ws.userId }));
      } catch {
        ws.send(JSON.stringify({ type: 'authExpired' }));
        ws.close();
      }

      ws.on('message', (message: string) => {
        const data = JSON.parse(message);
        if (data.type === 'updateToken') {
          try {
            const decoded = verifyToken(data.token);
            ws.userId = decoded.id;
          } catch {
            ws.send(JSON.stringify({ type: 'authExpired' }));
            ws.close();
          }
        }
      });
    });
  }

  broadcast(userId: string, message: any) {
    this.wss.clients.forEach((client: WebSocket & { userId?: string }) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(message));
      }
    });
  }
}