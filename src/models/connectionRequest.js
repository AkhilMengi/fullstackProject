

const mongoose = require('mongoose')

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:["ignored","accepted","rejected","interested"],
            message:`{VALUE}is not a valid status`
        }
    }

},{
    timestamps:true
})

connectionRequestSchema.index({fromUserId:1, toUserId:1})

connectionRequestSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    return next(new Error("Cannot send a request to yourself."));
  }
  next();
});


const Connection = mongoose.model("Connection",connectionRequestSchema);
module.exports = Connection;