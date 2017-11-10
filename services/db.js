const mysql = require('mysql');

const createConnection = function(database) {
   const db = {
       host: 'localhost',
       user: 'root',
       password: 'xxxx',
   };

   if (database) {
       db.database = database;
   }

   return mysql.createConnection(db);
};

const createDatabase = function(dbName) {
   const con = createConnection();
   console.log ('Connected!');

   con.connect( function(err) {
      if (err) throw err;
   });

   con.end();
};

connection.connect(function(err) {
    if (err) throw err;

    console.log('Connected!');

    // Create Database if it doesn't exist
   connection.query('CREATE DATABASE IF NOT EXISTS bamazon', function(err, result) {
       if (err) throw err;
       console.log('Database created!');
   });



});
