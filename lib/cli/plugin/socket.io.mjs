import { Server } from 'socket.io';

export default function(app) {
  return new Server(app);
}