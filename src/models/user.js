const mongoose = require("mongoose");
const validator = require("validator")


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,         // Makes field mandatory
    trim: true,
    minLength:4,
    maxLength:15
  },
  lastName: {
    type: String,
    trim: true,
    minLength:4,
    maxLength:15
  },
  emailId: {
    type: String,
    required: true,
    unique: true,           
    lowercase: true,        
    trim: true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Invalid Email")
        }
    }
  },
  password: {
    type: String,
    required: true,
    validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error("Weak password")
        }
    }
    
  },
  age: {
    type: Number,
    min: 18,
  },
  gender: {
    type: String,
    enum: {
    values:  ['male', 'female', 'other'] ,
    message:`{VALUE} is not a valid gender type`
    }
  },
  skills:{
    type:[String],
    validate: {
    validator: function (arr) {
      return arr.length <= 10;
    },
    message: 'You can have at most 10 skills.'
  }
  },
  about:{
    type:String,
    default:"Hello I am looking for connectins",
    minLength:4,
    maxLength:55
  }
}, { timestamps: true }); 

const User = mongoose.model("User", userSchema);

module.exports = User;
 