const mysql = require('mysql');
const productsMockData = require('../mock-data/productsMockData');

const baseDBName = 'bamazon';

// Method for creating MySQL connection.
// 'database' represents the name of the database you want to connect to and is optional.
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

// Method for creating a database.
// 'dbName' represents the name of your database and is required.
const createDatabase = function(dbName) {
    return new Promise((resolve, reject) => {
        if (!dbName) {
            return reject('Error: You need a database name!');
        }

        const con = createConnection();
        const queryStr = 'CREATE DATABASE IF NOT EXISTS ' + dbName;

        con.connect(function(err) {
            if (err) {
                return reject(err);
            };

            console.log('Connected!');

            // Create Database
            con.query(queryStr, function(err, result) {
                if (err) {
                    return reject(err);
                };
                console.log('Database "' + dbName + '" created!');
            });

            con.end(function(err) {
                if (err) {
                    return reject(err);
                };

                console.log('Connection Terminated\n');

                return resolve();
            });
        });
    });
};

// Method for creating a table in a database.
// 'config' should have the following properties:
// - dbName
// - tableName
// - cols
const createTable = function(config) {
    const dbName = config.dbName;
    const tableName = config.tableName;

    return new Promise((resolve, reject) => {
        if (!dbName) {
            return reject('Error: You need a database name!');
        }

        if (!tableName) {
            return reject('Error: You need a table name!');
        }

        const con = createConnection(dbName);
        const cols = config.cols;

        const productsTblSQL = 'CREATE TABLE IF NOT EXISTS ' + tableName + ' ' + cols;

        // Create Table
        con.query(productsTblSQL, function(err) {
            if (err) {
                return reject(err);
            };

            console.log('Table "' + tableName + '" created!');

            con.end(function(err) {
                if (err) {
                    return reject(err);
                };

                console.log('Connection Terminated\n');

                return resolve();
            });
        });
    });
};

const addRecordToTable = function(params) {
    const dbName = params.dbName;
    const tableName = params.tableName;
    const records = params.records;

    return new Promise((resolve, reject) => {
        if (!dbName) {
            return reject('Error: You need a database name!');
        }

        if (!tableName) {
            return reject('Error: You need a table name!');
        }

        if (!records) {
            return reject('Error: You need records to add to your table!');
        }

        const con = createConnection(dbName);
        const addQuery = 'INSERT INTO ' + tableName + ' ' + records;

        con.query(addQuery, function(err) {
            if (err) {
                return reject(err);
            };

            console.log('1 Record added!\n');

            con.end(function(err) {
                if (err) {
                    return reject(err);
                };

                console.log('Connection Terminated\n');

                return resolve();
            });
        });
    });
};

const getDataFromTable = function(params) {
    const dbName = params.dbName;
    const tableName = params.tableName;
    const cols = params.cols || '*';
    const filters = (params.filters && ' WHERE ' + params.filters) || '';

    return new Promise((resolve, reject) => {
        if (!dbName) {
            return reject('Error: You need a database name!');
        }

        if (!tableName) {
            return reject('Error: You need a table name!');
        }

        const con = createConnection(dbName);
        const selectQuery = 'SELECT ' + cols + ' FROM ' + tableName + filters;

        con.query(selectQuery, function(err, result) {
            if (err) {
                return reject(err);
            };

            // console.log('Records retrieved!\n');

            con.end(function(err) {
                if (err) {
                    return reject(err);
                };

                // console.log('Connection Terminated');

                return resolve(result);
            });
        });
    });
}

const updateDataInTable = function(params) {
    const dbName = params.dbName;
    const tableName = params.tableName;
    const cols = params.cols;
    const id = params.id;

    return new Promise((resolve, reject) => {
        if (!dbName) {
            return reject('Error: You need a database name!');
        }

        if (!tableName) {
            return reject('Error: You need a table name!');
        }

        if (!id) {
            return reject('Error: You need an ID to update the right record!');
        }

        if (!cols) {
            return reject('Error: You need data for updating columns!');
        }

        const con = createConnection(dbName);
        const selectQuery = 'UPDATE ' + tableName + ' SET ' + cols + ' Where item_id =\'' + id + '\'';

        con.query(selectQuery, function(err, result) {
            if (err) {
                return reject(err);
            };

            // console.log('Records retrieved!\n');

            con.end(function(err) {
                if (err) {
                    return reject(err);
                };

                // console.log('Connection Terminated');

                return resolve(result);
            });
        });
    });
};

const initDB = function() {
    // Create the bamazon Database
    return new Promise((resolve, reject) => {
        createDatabase(baseDBName).then(() => {
            // Create the products Table
            createTable({
                dbName: baseDBName,
                tableName: 'products',
                cols: '(item_id INT AUTO_INCREMENT PRIMARY KEY, product_name VARCHAR(255), department_name VARCHAR(255), price DECIMAL(13, 2), stock_quantity INT, product_sales DECIMAL(13, 2))',
            }).then(() => {
                // Create the departments Table
                createTable({
                    dbName: baseDBName,
                    tableName: 'departments',
                    cols: '(department_id INT AUTO_INCREMENT PRIMARY KEY, department_name VARCHAR(255), over_head_costs DECIMAL(13, 2))',
                }).then(() => {
                    // Populate products table with mock data
                    for (var i = 0; i < productsMockData.length; i++) {
                        const product = productsMockData[i];
                        // console.log('product: ', product);
                        const tableCols = 'product_name, department_name, price, stock_quantity, product_sales';
                        const colValues = '\'' + product.product_name + '\', \'' + product.department_name + '\', \'' + product.price + '\', \'' + product.stock_quantity + '\', \'' + product.product_sales +'\'';
                        const records = '(' + tableCols + ') VALUES(' + colValues + ')';

                        addRecordToTable({
                            dbName: baseDBName,
                            tableName: 'products',
                            records: records,
                        });
                    }
                }, (err) => {
                    return reject(err);
                });
            }, (err) => {
                return reject(err);
            });
        }, (err) => {
            throw err;
        });
    });
};

module.exports = {
    init: initDB,
    baseDBName: baseDBName,
    createTable: createTable,
    addRecordToTable: addRecordToTable,
    getDataFromTable: getDataFromTable,
    updateDataInTable: updateDataInTable,
};
