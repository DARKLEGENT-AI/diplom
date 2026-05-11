import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: true })
export class SessionsGateway {
  @WebSocketServer()
  server!: Server

  @SubscribeMessage('session.subscribe')
  handleSubscribe(client: Socket, payload: { sessionId: string }) {
    if (!payload?.sessionId) return
    client.join(this.roomName(payload.sessionId))
    client.emit('session.subscribed', { sessionId: payload.sessionId })
  }

  broadcastSessionUpdate(sessionId: string, payload: unknown) {
    this.server.to(this.roomName(sessionId)).emit('session.update', payload)
  }

  broadcastAnswer(sessionId: string, payload: unknown) {
    this.server.to(this.roomName(sessionId)).emit('session.answer', payload)
  }

  private roomName(sessionId: string) {
    return `session:${sessionId}`
  }
}
