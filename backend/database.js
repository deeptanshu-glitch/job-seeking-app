
import mongoose from "mongoose";

// creating schema

const Schema = mongoose.Schema

const jobSeekSchema = new Schema(
    {
        fullname: { type: String, required: true },
        username: { type: String, unique: true, required: true },
        email: { type: String, unique: true, required: true },
        phonenumber: { type: String, required: true },      
        password: { type: String, required: true }
    });

//exporting db
    
export default mongoose.model('User',jobSeekSchema)

