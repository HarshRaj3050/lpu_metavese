const mongoose = require('mongoose');
const config = require('../config/config');

async function connectDB() {
    try{
        await mongoose.connect(config.MONGO_URI)
        console.log("DataBase connected successfully...");

    } catch(err){
        console.log("Error : ", err);
    }
}

module.exports = connectDB