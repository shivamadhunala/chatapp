const exp = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

let activeConnections = {};

const app = exp();
let server = http.createServer(app);
let io = socketIO(server);
app.use(cors())




/* custom imports */
const {createMessage } = require('./helpers/message')
const createUser = require('./helpers/createUser').createUser;
const registeredUsers = require('./helpers/createUser').registeredUsers;
const getAllMessages = require('./helpers/message').getAllMessages;
const updateDeliveryNotification = require('./helpers/message').updateDeliveryNotification;
const readNoticationUpdate = require('./helpers/message').readNoticationUpdate;
// console.log(createUser);

io.on('connection', (socket) => {
        
     console.log('A new User has just connected');
     
      //register on the server 
     socket.on('save', async (data) => {
         
          socket.phone = data.phone;
          activeConnections[data.phone] = socket;
          let id = await createUser(data.phone, data.name);
          console.log('logging');
          console.log(id);
         
          console.log("No of total connections --> ", Object.keys(activeConnections).length);
           await updateUserNames();
          // loadAllPreviousMessages();
     })
     

     

     socket.on("message-from-client", async (msg,callback) => {
     
          // console.log(msg);
          let result;
          try {
               result = await createMessage (msg);
               if (result == -1) {
                    
               }
               else {
                    // socket.io.broadcast.emit('new-message', result);
                    io.sockets.emit('new-message', result);
               }
          }
          catch (err) {
               console.log('error in message-from-client')
               console.log(err);
          }
          
          
         

     });



     socket.on('delivery-notification', async (data) => {
          console.log('update time in messages line -->72');
          // console.log(data);
           await updateDeliveryNotification(data);
           console.log('succesfully updated');
            io.sockets.emit('receive-delivery-notification',data);
         
     })
     
  
     socket.on('readNotificationEmitter', async (data) => {
          console.log(data);

          await readNoticationUpdate(data);
          io.sockets.emit('receiveReadNotification',data);
  })




  
/*sending updated list to all the sockets (connections) */
  async   function updateUserNames() {
     
          //  console.log(registeredUsers)
       let regUsers=[];
       try {
             regUsers = await registeredUsers();
          //   console.log(regUsers);
       }
       catch (err) {
            console.log('Error in updateUserName');
            console.log(err);
       }
     
       let users = regUsers.map((element) => {
                 
               element.isOnline = false;
               if (activeConnections[element.phone] && activeConnections[element.phone]!='') {
                    element.isOnline = true;
               }

               return element;
          
          })
          // console.log(users);
          io.sockets.emit("get-users", users);
  }     
 




     /* when a user is disconnecteds*/
     socket.on('disconnect', async (data) => {
          
          console.log(socket.phone);
          delete activeConnections[socket.phone];
         
          console.log("No of total connections --> ", Object.keys(activeConnections).length);
          await updateUserNames();
     })
 })





const port = process.env.port || 3000;


app.get('/getAllMessages/:phone', getAllMessages);


server.listen(port, (err, res) => {

     if (err) {
          colsole.log(err);
     }
     else {
          console.log(`server is listening on ${port}`);
     }
     
})



//http://localhost:3000/socket.io/socket.io.js