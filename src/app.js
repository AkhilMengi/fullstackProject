const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user')
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, emailId, password, age, gender } = req.body;

        if (!firstName || !lastName || !emailId || !password) {
            return res.status(400).send("All required fields must be provided.");
        }

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).send("User already exists with this email.");
        }

        const user = new User({
            firstName,
            lastName,
            emailId,
            password,
            age,
            gender
        });

        await user.save();
        res.status(201).send("User added successfully.");

    } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).send(`Error saving the information: ${err.message}`);
    }
});

connectDB()
    .then(() => {
        console.log("✅ DB successfully connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ DB connection failed:", err.message);

    });
