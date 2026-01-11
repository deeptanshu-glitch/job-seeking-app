const express = require('express')
const mongoose = require('mongoose')

const app = express()

app.use(express.json())

//Connecting database

mongoose.connect("mongodb://localhost:27017/Job-Seeking-site")

// creating schema

const Schema = mongoose.Schema

const jobSeekSchema = new Schema(
    {
        Username: String,
        email: String,
        phoneNumber: Number,
        password: String
    });
    
module.exports = mongoose.model('Users',jobSeekSchema)

