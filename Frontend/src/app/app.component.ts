import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ChatService } from './services/chat/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('popup', {static: false}) popup: any;

  public roomId: string;
  public messageText: string;
  public messageArray = [];
  private storageArray = [];

  public showScreen = false;
  public email: string;
  public phone: number;
  name: string = '';
  public currentUser;
  public selectedUser;
  public isCalled: boolean = false;
  public userList = [];

  constructor(
    private modalService: NgbModal,
    private chatService: ChatService
  ) {
  }

  ngOnInit(): void {

    console.log("in ngOnInit");
    this.chatService.getMessage()
      .subscribe((data:any) => {
        console.log('new Message')
        console.log(data);

        if ((data.to == this.currentUser.phone) || (data.from == this.currentUser.phone)) {
          console.log('succesfully added to allMessages');
          this.chatService.allMessages.push(data);
          console.log('logging');
          console.log(data.id);
          console.log(this.chatService.allMessages.length - 1);
          this.chatService.mp.set(data.id,this.chatService.allMessages.length-1);
        }
          

        if ( (this.selectedUser) && ((this.selectedUser.phone == data.from) || (this.selectedUser.phone == data.to))) {
          console.log('added to messageArray');
          console.log(this.messageArray)
          this.messageArray.push(data);
           console.log(this.messageArray)
          }
        
        //when you receive a new Message update that in server
        console.log('verify');
        console.log(data);
        if (data.to == this.currentUser.phone) {

          console.log('condition is succesful')
          let IdArray = [];
          IdArray.push(data.id);
          let obj = {
            updateMessagesId: IdArray,
            time:Date.now()
          }

          this.chatService.messageDeliveryEmitter(obj);
        }
         
        
      });
  
   
   
    
  }

  ngAfterViewInit(): void {
    this.openPopup(this.popup);
  }

  openPopup(content: any): void {
    this.modalService.open(content, {backdrop: 'static', centered: true});
  }

  login(dismiss: any): void {

    this.chatService.login({ phone: this.phone, name: this.name }).subscribe(
      (data) => {
        // console.log(data);
     
        this.chatService.registeredUsers = data;
        console.log(this.chatService.registeredUsers);
        this.currentUser = this.chatService.registeredUsers.find((user:any) => user.phone == this.phone);
        this.userList = this.chatService.registeredUsers.filter((user:any) => user.phone != this.phone);
        this.chatService.currentUser = this.currentUser;
        console.log('current user data');
        console.log(this.currentUser);
          
        if (this.currentUser && !this.isCalled) {
          this.isCalled = true;

          this.chatService.messagesDeliveryHelper();
          this.receiveDeliveryNotificationHandler();
          this.receiveReadNotification();
            this.showScreen = true;
            dismiss();
          }
      }
    );

  
   
  }

  selectUserHandler(phone: string): void {
    this.selectedUser = this.userList.find(user => user.phone === phone);
    console.log('logging selecteduser details');
    console.log(this.selectedUser);
    this.messageArray = [];
     
    this.messageArray=this.chatService.allMessages.filter((message:any) => {
      return (message.to==phone || message.from==phone) 
    });
    console.log('after clicking a user');
    // console.log(this.messageArray);
    
    let updateReadMessageIds = [];
    for (let i = 0; i < this.messageArray.length; i++) {
      if ((this.messageArray[i].isRead == false) && (this.messageArray[i].to == this.currentUser.phone)) {
       updateReadMessageIds.push(this.messageArray[i].id);
      }
     
    }

     //console.log(updateReadMessageIds)
    if(updateReadMessageIds.length>0)
    this.chatService.readNotificationEmitter(updateReadMessageIds);
    

    
  }

  join(username: string, roomId: string): void {
    this.chatService.joinRoom({user: username, room: roomId});
  }

  sendMessage(): void {
    this.chatService.sendMessage({
      to: this.selectedUser.phone,
      from:this.currentUser.phone,
      message: this.messageText
    });


  }


receiveDeliveryNotificationHandler() {
  // console.log("confirming")
 this.chatService.receiveDeliveryNotification().subscribe(
      (data) => {
        console.log('data to be updated is:in allMessageArray')
        console.log(data.updateMessagesId);
          
        let count = 0;
        for (let i = 0; i < data.updateMessagesId.length; i++){
           
          if (this.chatService.mp.has(data.updateMessagesId[i])) {
            count++;
            let index = this.chatService.mp.get(data.updateMessagesId[i]);
            // console.log("map-index: - ", index);
            this.chatService.allMessages[index].deliveredAt = data.time;
            // console.log(this.chatService.allMessages[index]);
          }
     }
     
     if (count > 0 && this.selectedUser) {
       
       this.selectUserHandler(this.selectedUser.phone);
       
     }
     
      },
      (err) => {
        console.log(err);
      }
    );

  }
  

  receiveReadNotification() {
    console.log('readNotification is called');
    this.chatService.receiveReadListener().subscribe(data => {
       
      console.log('receive read Notification');
      console.log(data);
      console.log('map data');
      console.log(this.chatService.mp);

      for (let i = 0; i < data.length; i++) {
        let messageId = (data[i]);
        if (this.chatService.mp.has(messageId)) {
          let index = this.chatService.mp.get(messageId);
          console.log('index ', index);
          this.chatService.allMessages[index].isRead = true;
          console.log(this.chatService.allMessages[index])
        }

      }

      
      if (!this.selectedUser || this.selectedUser == '') {
        return;
    }
    this.messageArray = []; 
    this.messageArray=this.chatService.allMessages.filter((message:any) => {
      return (message.to==this.selectedUser.phone || message.from==this.selectedUser.phone) 
    });

    },
      (err) => {
        console.log('error occured in receiveNotification');
        console.log(err);
    })
  }


}




