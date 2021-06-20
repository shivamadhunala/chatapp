
const config = {
    user :"team1_db_user",
    password :'Dt@2021',
    server:'ec2-3-85-95-110.compute-1.amazonaws.com',
    database: 'realTimeChat',
    pool: { max: 100 },
    connectionTimeout: 30000,
    requestTimeout: 30000,
    options: { encrypt: false,enableArithAbort : true },
    port :1433 
}


// const config = {
//     user :process.env.MSSQL_DB_LOGIN_USERNAME,
//     password :process.env.MSSQL_DB_LOGIN_PASSWORD,
//     server:process.env.MSSQL_SERVER_HOST,
//     database:process.env.MSSQL_DB_NAME,
//     pool: { max: process.env.MSSQL_CONNECTION_MAX_POOL },
//     connectionTimeout: 30000,
//     requestTimeout: 30000,
//     options: { encrypt: false,enableArithAbort : true },
//     port :1433 
// }


module.exports = config; 