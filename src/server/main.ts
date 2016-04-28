import * as express from 'express'
import * as http from 'http'
import * as sio from 'socket.io'
import * as path from 'path'
import {Observable, Subject} from 'rxjs'

const app = express();
const server = http.createServer(app);
const io = sio.listen(server);
const port = process.env.port || 8080;

interface SocketMessage {
	action:string;
	broadcast?:boolean;
	data?:any;
}

class SocketConnection {
	messages: Observable<any>;
	broadcasts: Observable<any>;
	pings: Observable<any>
	id: string;
	constructor(private _socket: SocketIO.Socket){
      this.id = _socket.id;
      this.messages = Observable.fromEvent(_socket, 'message');
	  let disconnect = Observable.fromEvent(_socket, 'disconnect');
	  let outgoing = (message) => _socket.send(message);
	  this.broadcasts = this.messages.filter(message => message.broadcast);
	  this.pings = this.messages.filter(message => message.action === 'ping');
	}

	listen(eventName){
		return this.messages.filter(message => message.type === eventName);
	}

	next(message){
		console.log('sending message to', this.id, message);
		this._socket.send(message);
	}
	broadcast(message){
		this._socket.broadcast.send(message)
	}
}

//channel for broadcast to all
let broadcasts = new Subject();

broadcasts.subscribe(message => {
	io.sockets.send(message);
})



let connections:Observable<SocketIO.Socket> = Observable.create(connectionObserver => {
	io.on('connection', (connection) => connectionObserver.next(connection));
})
  .map(socket => new SocketConnection(socket))
  .forEach((socket:SocketConnection) => {
	  //send incoming messages to the broadcast channel
	  socket.broadcasts.subscribe(broadcasts);

	  socket.pings.forEach((ping) => {
		  console.log('got ping from', socket.id);
		  socket.next({action: 'pong', data:{ timestamp: Date.now() }});
	  }, socket);
  })



server.listen(port, () => {
    console.log("Listening on port %s...", server.address().port);
});
