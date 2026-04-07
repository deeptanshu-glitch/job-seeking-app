import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema({

    title: {type: String , required: true},

    description: {type: String , required: true},
    
    requirements: {type: [String], default: []},
    
    location: {type: String , required: true},
    
    salary: {type: String , default: "Not specified"},
    
    jobtype: {type: String , required: true},

    experience: {type: String, default: ""},
    
    companyName: {type: String, required: true},
    
    position: {type: String , required: true},

    status: {type: String, enum: ['active', 'closed', 'draft'], default: 'active'},

    applications: [{type: mongoose.Schema.Types.ObjectId, ref: "Application"}],
    
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: "User" , default: null},
    
},{timestamps: true})

const job = mongoose.model("job" , recruiterSchema )

export default job