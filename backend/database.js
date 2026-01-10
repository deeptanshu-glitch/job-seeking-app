const mongoose = require ('mongoose')

// creating schema

const Schema = mongoose.Schema

const jobSeekSchema = new Schema(
    {
        Username: String,
        email: String,
        phoneNumber: Number,
        password: String
    }
)

//connecting with the database

mongoose.exports = mongoose.model('Users',jobSeekSchema)