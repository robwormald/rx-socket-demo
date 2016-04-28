import {bootstrap} from 'angular2/platform/browser'
import {provide} from 'angular2/core'
import {SocketApp} from './app'
import {SocketConfig} from './socket'

bootstrap(SocketApp, [
	provide(SocketConfig, {useValue: {url: 'http://localhost:8080'}})
]);
