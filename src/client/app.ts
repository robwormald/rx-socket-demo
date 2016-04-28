import {Component} from 'angular2/core'
import {SocketService} from './socket'

@Component({
	selector: 'socket-app',
	template: `
	  <div>hello world</div>
	`,
	providers: [SocketService]
})
export class SocketApp {
	constructor(socket:SocketService){
		console.log(socket)
		socket.messages.subscribe(message => console.log(message));
		socket.send({action: 'ping'});

		socket.listen('')
	}
}
