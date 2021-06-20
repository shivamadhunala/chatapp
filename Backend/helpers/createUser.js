const config=require('../dbconfig')
const sql = require('mssql');

async function createUser(phone, name) {
     
     console.log('createUser api')
     let pool;
     try {
           pool = await new sql.ConnectionPool(config).connect();
          const request = pool.request();
          console.log('successfully connected to db')
          request.input('phone', phone);
          request.input('name', name);
          response = await request.execute('createUser');
          // console.log(response);
          return response.recordset[0].Id;
     }
     catch (err) {

          console.log('some error occured while user registrations');
          console.log(err);
          return -1;
          
     }
     finally {
          if (pool) {
               pool.close();
          }
     }
     

}

async function getAllRegisteredUsers() {
     
     console.log('get ALL Registered Users');
     let pool;
     try {
          
          pool = await new sql.ConnectionPool(config).connect();
          const request = pool.request();
          console.log('successfully connected to db');
          response = await request.execute('getAllRegisteredUsers');
          return response.recordset;
     }
     catch (err) {
          
     }
     finally {
          if (pool) {
               pool.close();
          }
     }
}



module.exports = {
     createUser: createUser,
     registeredUsers:getAllRegisteredUsers
}