

const express = require('express')
const profileRouter = express.Router()
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const { profileUpdateValidator } = require('../utils/validation');

//Getting all User
profileRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const users = await User.find();

        if (users.length === 0) {
            return res.status(404).send("No users found");
        }

        res.status(200).json(users);
    } catch (err) {
        res.status(500).send(`Error fetching users: ${err.message}`);
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
