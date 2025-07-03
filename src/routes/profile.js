

const express = require('express')
const profileRouter = express.Router()
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const { profileUpdateValidator } = require('../utils/validation');
const Connection = require('../models/connectionRequest');

//Getting all User
profileRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        // Step 1: Find all connections involving the logged-in user
        const connections = await Connection.find({
            $or: [
                { fromUserId: loggedInUser },
                { toUserId: loggedInUser }
            ]
        });

        // Step 2: Build a set of user IDs to exclude
        const excludedUserIds = new Set();
        connections.forEach((conn) => {
            // Exclude everyone connected or pending or ignored or rejected
            excludedUserIds.add(String(conn.fromUserId));
            excludedUserIds.add(String(conn.toUserId));
        });
        // Also exclude self
        excludedUserIds.add(String(loggedInUser));

        // Step 3: Fetch all other users
        const limit = parseInt(req.query.limit) || 2;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const users = await User.find({
            _id: { $nin: Array.from(excludedUserIds) }
        })
            .select("firstName lastName gender bio profilePicture")
            .limit(limit)
            .skip(skip);

        if (users.length === 0) {
            return res.status(404).json({
                message: "No users found"
            });
        }

        res.status(200).json({
            message: "User feed fetched successfully",
            data: users
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Error fetching users: ${err.message}` });
    }
});



//Getting user profile
profileRouter.get("/profile", userAuth, (req, res) => {
    if (!req.user) {
        return res.status(500).send("Unexpected error: user not attached.");
    }
    res.status(200).json({
        message: "Logged in user fetched successfully",
        user: req.user
    });
});


//Updating the profile
profileRouter.patch("/update/me", userAuth, async (req, res) => {
    try {
        const userId = req?.user._id;
        const updates = req.body;

        if (!userId) {
            return res.status(400).send({ error: "Authenticated user ID not found" });
        }

        profileUpdateValidator(updates);

        if (updates.about && typeof updates.about === "string") {
            updates.about = updates.about.trim();
        }
        if (updates.lastName && typeof updates.lastName === "string") {
            updates.lastName = updates.lastName.trim();
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
            select: "-password"
        });

        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});
module.exports = profileRouter
