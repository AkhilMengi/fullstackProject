const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/database');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use('/api', authRouter);
app.use('/api', profileRouter);
app.use('/api', requestRouter);
app.use('/api', userRouter);

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
