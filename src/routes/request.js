
const express = require('express')
const requestRouter = express.Router()
const Connection = require('../models/connectionRequest')
const { userAuth } = require('../middlewares/auth');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { status, toUserId } = req.params;

    if (!toUserId) {
      return res.status(400).json({ error: "toUserId is required." });
    }

    if (!status) {
      return res.status(400).json({ error: "status is required." });
    }

    // Validate status value
    const validStatuses = ["ignored","interested"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `${status} is not a valid status.` });
    }

    //Code to check that request can be send only once
    const existingConnectionRequest = await Connection.findOne({
        $or:[
            {fromUserId,toUserId},
            {fromUserId:toUserId,toUserId:fromUserId},
        ]
    })
    if(existingConnectionRequest){
        return res.status(400).json({message:"Request already present"})
    }
    const connectionRequest = new Connection({
      fromUserId,
      toUserId,
      status,
    });

    const saved = await connectionRequest.save();

    res.status(201).json({
      message: `New connection Request Received from ${req.user.firstName}`,
      data: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error creating connection request: ${err.message}` });
  }
});

requestRouter.post('/request/review/:status/:requestId',userAuth,async(req,res)=>{
    try{
        const loggedInUserId=req?.user._id;
        const {requestId,status} = req.params
        
    // Validate status value
    const validStatuses = ["accepted","rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `${status} is not a valid status.` });
    }

    const connectionRequest = await Connection.findOne({
        _id: requestId,
        toUserId:loggedInUserId,
        status: "interested",
    })
    if(!connectionRequest){
        return res.status(404).json({message:"Connection Request Not Found"})
    }

    connectionRequest.status = status

    const data = await connectionRequest.save()

    res.status(201).json({
        message:"Connection request status changed",
        data:data
    })

    } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error creating connection request: ${err.message}` });
  }
})


module.exports= requestRouter