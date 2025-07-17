

const express = require('express')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const authRouter = express.Router()
const User = require('../models/user');
const { signUpValidator, validateStrongPassword } = require('../utils/validation');
const { userAuth } = require('../middlewares/auth');

authRouter.post('/signup', async (req, res) => {
    try {
        signUpValidator(req)

        const { firstName, lastName, emailId, password, age, gender } = req.body;

        const passwordHash = await bcrypt.hash(password, 10)

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).send("User already exists with this email.");
        }

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender
        });

        await user.save();
        const token = jwt.sign({ id: user._id }, "DEVTINDER_!@##$$", {
            expiresIn: "7d"
        });
        const profileComplete = Boolean(
            user.skills?.length >= 3 &&  // at least 3 skills
            user.about?.length >= 10 &&  // about section is at least 10 chars
            user.age &&
            user.gender
        );

        res.status(201).cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).send({
            message: "Signup successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailId,
                // optional:
                profileComplete

            }
        });


    } catch (err) {
        console.error("Signup error:", err.message);

        if (err.type === "validation") {
            res.status(400).send(`Validation Error: ${err.message}`);
        } else {
            res.status(500).send(`Error: ${err.message}`);
        }
    }

});

authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).send("Invalid details.");
        }

        const existingUser = await User.findOne({ emailId });
        if (!existingUser) {
            return res.status(401).send("Invalid credentials.");
        }

        const isValidPassword = await bcrypt.compare(password, existingUser.password);
        if (!isValidPassword) {
            return res.status(401).send("Invalid credentials.");
        }
        // Convert to plain object and remove password
        const userWithoutPassword = existingUser.toObject();
        delete userWithoutPassword.password;
        const token = jwt.sign({
            _id: existingUser._id
        },
            "DEVTINDER_!@##$$",
            { expiresIn: "1h" });

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict"
        });

        res.status(200).send(userWithoutPassword);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
});

authRouter.post("/logout", userAuth, async (req, res) => {
    res.cookie("token", null, {
        maxAge: 0,
        httpOnly: true,
        sameSite: "strict",
    })
    res.status(200).json({
        message: `${req?.user.firstName} logged out Successfully`
    })
})
authRouter.post("/updatePassword", userAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "Both oldPassword and newPassword are required." });
        }
        validateStrongPassword(newPassword)
        const userWithPassword = await User.findById(req?.user._id).select("+password")
        if (!userWithPassword) {
            return res.status(404).json({ error: "Invalid Credentials" })
        }
        const isValidPassword = await bcrypt.compare(oldPassword, userWithPassword.password);
        if (!isValidPassword) {
            return res.status(401).send("Invalid credentials.");
        }
        const passwordHash = await bcrypt.hash(newPassword, 10)
        userWithPassword.password = passwordHash
        await userWithPassword.save()
        res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Error updating password: ${err.message}` });
    }
});



module.exports = authRouter;