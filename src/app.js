const express = require('express');

const cookieParser = require('cookie-parser')
const connectDB = require('./config/database');



const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser())

app.use('/',authRouter)
app.use('/',profileRouter)
app.use('/',requestRouter)

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
