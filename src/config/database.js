

const mongoose = require("mongoose")

const connectDB = async ()=>{
    await mongoose.connect("mongodb+srv://myuser:Akhil19971324@cluster0.3rslsce.mongodb.net/")
}  


module.exports = connectDB
  
