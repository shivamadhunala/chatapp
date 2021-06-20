const config=require('../dbconfig')
const sql = require('mssql');


async function createMessage(message) {

      console.log('createMessage api')
     let pool;
     try {
          pool = await new sql.ConnectionPool(config).connect();
          const request = pool.request();
          console.log('successfully connected to db');
          request.input('from', message.from);
          request.input('to', message.to);
          request.input('message', message.message);
          request.input('createdAt', Date.now());
          response = await request.execute('createMessage');
          console.log(response.recordset[0])
          return response.recordset[0];
     }
     catch (err) {
          console.log(err);
          return -1;
     }
     finally {
          if (pool) {
               pool.close();
          }
     }
     
}


async function getAllMessages(req, res, next) {

     console.log('createMessage api')
     let pool;
     try {
          pool = await new sql.ConnectionPool(config).connect();
          const request = pool.request();
          console.log('successfully connected to db');
          request.input('phone', req.params.phone);
          response = await request.execute('getAllMessages');
          console.log('get all messages');
          // console.log(response);
          return res.status(200).json({message:'success',data:response.recordset})
     }
     catch (err) {
          console.log('some error has occured');
          console.log(err);
     }
     finally {
          if (pool) {
               pool.close();
          }
     }



}
 


async function updateDeliveryNotification(obj) {

     let tvpId = new sql.Table();
     tvpId.columns.add('id', sql.BigInt);
     for (let i = 0; i < obj.updateMessagesId.length;i++) {
        tvpId.rows.add(parseInt(obj.updateMessagesId[i]));  
     }
     let pool;
     let request;
     try {
           pool = await new sql.ConnectionPool(config).connect();
           request = pool.request();
           request.input('time', sql.BigInt, obj.time);
          request.input('tvp', tvpId);
          console.log('success');
          let response = await request.execute('spDeliveryNotification');
          console.log(response);

     }
     catch (err) {
          console.log('some error has occured');
          console.log(err);
     }
     finally {
          if(pool)
          pool.close();
     }
     
     
}



async function readNoticationUpdate(data) {

      let tvpId = new sql.Table();
      tvpId.columns.add('id', sql.BigInt);     
      for (let i = 0; i < data.length;i++) {
        tvpId.rows.add(parseInt(parseInt(data[i])));  
     }
      let pool;
     let request;
     try {
          pool = await new sql.ConnectionPool(config).connect();
          request = pool.request();
          request.input('tvp', tvpId);
          let response = await request.execute('readFieldUpdate');
          console.log(response);
          console.log('success');
     }
     catch (err) {
          console.log('some error');
          console.log(err);
     }
     finally {
         if(pool)
          pool.close(); 
     }
}


module.exports ={createMessage, getAllMessages, updateDeliveryNotification,readNoticationUpdate} ;