import socketIO from 'socket.io-client'
import { Observable, Observer, Subject } from 'rxjs'

export class Socket {
   private socket: SocketIOClient.Socket
   static instance

   constructor(private url: string, private options?: SocketIOClient.ConnectOpts) {
      if (!!Socket.instance) {
         return Socket.instance
      }
      Socket.instance = this
      this.socket = socketIO(this.url, this.options)
   }

   public addListener(): Observable<string> {
      return new Observable<string>((subscriber: Observer<string>) => {
         this.socket.on('connect', (socket) => {
            subscriber.next('connected')
         })

         this.socket.on('disconnect', () => {
            subscriber.next('disconnected')
         })

         this.socket.on('error', () => {
            subscriber.error('error')
         })

         return () => {
            this.socket.disconnect()            
         }
      })
   }

   public publish(event: string, payload?: any, callback?: Function): void {
      this.socket.emit(event, payload, callback)
   }

   public subscribe<T>(event: string): Observable<T> {
      return this.onEventObservable(event)
   }

   private onEventObservable<T>(event: string): Observable<T> {
      return new Observable<T>((subscriber: Observer<T>) => {
         this.socket.on(event, (data: T) => {
            subscriber.next(data)
         })
      })
   }
}