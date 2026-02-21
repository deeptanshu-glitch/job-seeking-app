import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema({

    title: {type: String , required: true},

    description: {type: String , required: true},
    
    requirements: {type: String , required: true},
    
    location: {type: String , required: true},
    
    salary: {type: String , required: true},
    
    jobtype: {type: String , required: true},

    experience: {type: String , required: true},
    
    company: {type: mongoose.Schema.Types.ObjectId, ref: "Company" , required: true},
    
    position: {type: String , required: true},

    application: {type: mongoose.Schema.Types.ObjectId, ref: "Application" , default: null},
    
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: "User" , default: null},
    
},{timestamps: true})

export const job = mongoose.model("recruition" , recruiterSchema )