import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import {environment } from 'src/environments/environment'
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private socket: Socket;
  private url = 'http://localhost:3000'; // your server local path
  private apiBaseUrl = environment.apiBaseUrl;
  public currentUser;
  public mp = new Map();
  //{id,index }
  constructor(private http:HttpClient) {
    this.socket = io(this.url, {transports: ['websocket', 'polling', 'flashsocket']});
  }

 
  public allMessages: any = [];
  public registeredUsers:any= [];
  joinRoom(data): void {
    this.socket.emit('join', data);
  }

  sendMessage(data): void {
    console.log(data);
    this.socket.emit('message-from-client', data);
  }

  getMessage(): Observable<any> {
    return new Observable<{user: string, message: string}>(observer => {
      this.socket.on('new-message', (data) => {
        observer.next(data);
      });

     
    });
  }

  getStorage() {
    const storage: string = localStorage.getItem('chats');
    return storage ? JSON.parse(storage) : [];
  }

  setStorage(data) {
    localStorage.setItem('chats', JSON.stringify(data));
  }

  login(userObj: any) {
    
    this.socket.emit('save', userObj);
    console.log(this.apiBaseUrl + 'getAllMessages/' + userObj.phone);
    this.http.get<any>(this.apiBaseUrl + 'getAllMessages/' + userObj.phone).subscribe(
      (data) => {
        console.log('getAllMessages api is returned Data succesfully');
        this.allMessages = data.data;
        // console.log(this.allMessages);
        for (let i = 0; i < this.allMessages.length; i++){
          this.mp.set(this.allMessages[i].id,i);
        }
         
        // console.log(this.mp);
          
      },
      (err) => {
        console.log(err);
      }
    );
  
    return this.pullOnlineUsers();

    
  }

  pullOnlineUsers() {

    console.log('pullOnlineUsers is triggered');
    return new Observable<any>((observer => {
           this.socket.on('get-users', (data) => {
              observer.next(data);
            
           })
    }))
    
  }


  messagesDeliveryHelper() {
    
    let updateMessagesId = [];
    this.allMessages.filter((message) => {
      
      // console.log(message.to==this.currentUser.phone)
      if ((((!message.deliveredAt) || (message.deliveredAt == '' )) && (message.to==this.currentUser.phone))) {
        updateMessagesId.push(message.id);
            return message.id;
        }
        
    });
    //  console.log('Messages of the Ids to be updated');
    //  console.log(updateMessagesId);
    let obj = {
      updateMessagesId: updateMessagesId,
      time: Date.now()
    }
    if (updateMessagesId.length > 0) {
      //emit only when you have data to emit
      
      this.messageDeliveryEmitter(obj);
    }
    
  }
  
  messageDeliveryEmitter(obj:any) {


    console.log('updating time from client is sending');
    console.log(obj);
    this.socket.emit('delivery-notification', obj);
   
  }

 
  receiveDeliveryNotification() :Observable<any>{

    console.log('receiveDeliveryNotification is triggered');
    return new Observable<any>(observer => {

       this.socket.on('receive-delivery-notification', (data) => {
            observer.next(data);
      })

     
    });
    
    
  }


  readNotificationEmitter(a) {


    console.log('readNotificationEmitter is Emitted and data is received');
    console.log(a);
    this.socket.emit('readNotificationEmitter', a);
    
  }

  receiveReadListener() {

    console.log('receiveReadNotification is triggered');
    return new Observable<any>(observer => {

       this.socket.on('receiveReadNotification', (data) => {
            observer.next(data);
      })

     
    });
    
  }
 



}
