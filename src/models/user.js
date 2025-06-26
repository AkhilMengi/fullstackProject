const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,         // Makes field mandatory
    trim: true              // Removes extra spaces
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true,           // Prevent duplicate emails
    lowercase: true,        // Normalize for matching
    trim: true
  },
  password: {
    type: String,
    required: true
    // Do not store plaintext passwords — hash before save!
  },
  age: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'] // Optional restriction
  }
}, { timestamps: true }); // Adds createdAt and updatedAt

const User = mongoose.model("User", userSchema);

module.exports = User;
 