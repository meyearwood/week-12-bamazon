const db = require('./services/db');
const inquirer = require('inquirer');
require('console.table');

var productIds = [];
var productId, quantity;

const init = function() {
    // Display Products Table
    showProductsData().then((results) => {
        setProductIds(results);
        console.log('\n');
        console.log('Products for sale:');
        console.log('\n');
        console.table(results);
        console.log('\n');
        promptForId();
    }, (err) => {
        throw err;
    });
};

const setProductIds = function(products) {
    for (var i = 0; i < products.length; i++) {
        var product = products[i];

        productIds.push(product['item_id']);
    }
};

const showProductsData = function(params) {
    return new Promise((resolve, reject) => {
        db.getDataFromTable({
            dbName: db.baseDBName,
            tableName: 'products',
            cols: 'item_id, product_name, price',
        }).then((results) => {
            return resolve(results);
        }, (err) => {
            return reject(err);
        });
    });
};

const promptForId = function() {
    const promptMsg = 'What is the item_id of the product you want to buy?';
    const question = {
        type: 'input',
        name: 'productId',
        message: promptMsg,
        validate: validateProductId,
    };

    inquirer.prompt([question]).then(handleProductIDResp);
};

const validateProductId = function(id) {
    if (productIds.indexOf(parseInt(id)) > -1) {
        return true;
    }

    return 'The item_id you entered is invalid. Please try again.';
};

const handleProductIDResp = function(resp) {
    productId = parseInt(resp.productId);
    promptForQuantity();
};

const promptForQuantity = function() {
    const promptMsg = 'How many do you want?';
    const question = {
        type: 'input',
        name: 'quantity',
        message: promptMsg,
        validate: validateQuantity,
    };

    inquirer.prompt([question]).then(handleQuantityResp);
};

const validateQuantity = function(quant) {
    const quantity = parseInt(quant);

    if (isNaN(quantity)) {
        return 'You entered an invalid quantity. Please enter a numeric value for the amount you want to buy.';
    }

    return true;
};

const handleQuantityResp = function(resp) {
    quantity = parseInt(resp.quantity);
    handleValidateTransaction();
}

const handleValidateTransaction = function() {
    getProduct().then((resp) => {
        const product = resp[0];

        if (quantity > product['stock_quantity']) {
            handleInsufficientInventory();
        } else {
            handleCompleteTransaction(product);
        }
    }, (err) => {
        throw err;
    });
};

const handleInsufficientInventory = function() {
    console.log('There is not enough inventory for this product to place your order.');
}

const handleCompleteTransaction = function(product) {
    const remainingQuantity = product['stock_quantity'] - quantity;
    const customerTotal = product.price * quantity;
    const productSales = product['product_sales'] += customerTotal;
    // console.log('handleCompleteTransaction: ', product);
    // console.log('remainingQuantity: ', remainingQuantity);
    // console.log('productSales: ', productSales);

    db.updateDataInTable({
        dbName: db.baseDBName,
        tableName: 'products',
        id: productId,
        cols: 'stock_quantity = \'' + remainingQuantity + '\', product_sales = \'' + productSales + '\'',
    }).then((resp) => {
        console.log('\n');
        console.log('Your purchase was successful!\n');
        console.log('Your total was $' + customerTotal + '\n');
    }, (err) => {
        throw err;
    });
};

const getProduct = function() {
    return new Promise((resolve, reject) => {
        db.getDataFromTable({
            dbName: db.baseDBName,
            tableName: 'products',
            filters: 'item_id = \'' + productId + '\'',
        }).then((resp) => {
            return resolve(resp);
        }, (err) => {
            return reject(err);
        });
    });
};

// Node will call this when it executes this file.
init();
