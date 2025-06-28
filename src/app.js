const express = require('express');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
const connectDB = require('./config/database');
const User = require('./models/user');
const { signUpValidator } = require('./utils/validation');
const { userAuth } = require('./middlewares/auth');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser())


//Signup api
app.post('/signup', async (req, res) => {
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
        res.status(201).send("User added successfully.");

    } catch (err) {
        console.error("Signup error:", err.message);

        if (err.type === "validation") {
            res.status(400).send(`Validation Error: ${err.message}`);
        } else {
            res.status(500).send(`Error: ${err.message}`);
        }
    }

});

app.post('/login', async (req, res) => {
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

        res.status(200).json({
            message: `Welcome! ${existingUser.firstName}`
        });
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
});


//Getting all User
app.get("/feed", async (req, res) => {
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


//Getting User by email id

app.get("/profile", userAuth, (req, res) => {
  if (!req.user) {
    return res.status(500).send("Unexpected error: user not attached.");
  }
  res.status(200).json({
    message: "Logged in user fetched successfully",
    user: req.user
  });
});




//Getting user by Id/:id

app.get("/user/:_id", async (req, res) => {
    try {
        const userId = req.params._id; // GET requests use query params

        if (!userId) {
            return res.status(400).send("_id is required in URL");
        }

        const user = await User.findById({ _id: userId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).send(`Error fetching user: ${err.message}`);
    }
});


//Delete a particular
app.delete("/user/:_id", async (req, res) => {
    try {
        const userId = req.params._id;

        if (!userId) {
            return res.status(400).send("_id is required in URL");
        }

        // ✅ Use the ID directly, not inside an object
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.status(200).json({
            message: "User deleted successfully",
            userDeleted: user
        });
    } catch (err) {
        res.status(500).send(`Error deleting user: ${err.message}`);
    }
});

//Updating a value

app.patch("/user/:id", async (req, res) => {
    try {
        const userId = req?.params.id;
        const updates = req.body;

        const ALLOWED_UPDATES = ["skills", "about", "lastName"];

        // Validate only allowed fields are being updated
        const isUpdateAllowed = Object.keys(updates).every(k =>
            ALLOWED_UPDATES.includes(k)
        );

        if (!isUpdateAllowed) {
            return res.status(400).send({ error: "Update not allowed" });
        }

        if (updates?.skills && updates?.skills.length > 10) {
            return res.status(400).send({ error: "You can have at most 10 skills." });
        }

        if (!userId) {
            return res.status(400).send({ error: "User ID is required in URL" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        res.status(500).send({ error: `Error updating user: ${err.message}` });
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
