
const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Connection = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/requests", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const firstName = req.user.firstName
        const connectionRequests = await Connection.find({
            toUserId: loggedInUser,
            status: "interested"
        }).populate("fromUserId", "firstName lastName gender skills about ")

        if (connectionRequests.length === 0) {
            return res.status(404).json({
                message: "No pending requests"
            });
        }
        res.status(200).json({
            message: `Pending request for user ${firstName}`,
            data: connectionRequests
        })

    } catch (err) {
        res.status(500).json({ error: `Error fetching connection requests: ${err.message}` })
    }
})

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const connections = await Connection.find({
            $or: [
                { toUserId: loggedInUser },
                { fromUserId: loggedInUser }
            ], status: "accepted"
        })
        .populate("fromUserId", "firstName lastName gender skills about ")
        .populate("toUserId", "firstName lastName gender ")


        if (connections.length === 0) {
            return res.status(404).json({
                message: "No Connections"
            });

        }
        const data = connections.map((row) => {
            // If I sent the request, the other user is the recipient
            const isSender = row.fromUserId._id.equals(loggedInUser);
            return {
                user: isSender ? row.toUserId : row.fromUserId,
                role: isSender ? "sent" : "received",
                connectionId: row._id,
                status: row.status,
                acceptedAt:row.updatedAt
            };
        });
        res.status(200).json({
            message: `Connection for User `,
            data
        })
    } catch (err) {
        res.status(500).json({ error: `Error fetching connections: ${err.message}` })
    }


})

module.exports = userRouter