const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/database');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
require('dotenv').config()
const app = express();
const http = require("http"); //socket.io
const initializeSocket = require('./utils/socket');
const chatRouter = require('./routes/chat');
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
app.use('/api', chatRouter);

const server = http.createServer(app)


initializeSocket(server)

connectDB()
    .then(() => {
        console.log("✅ DB successfully connected");

        server.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ DB connection failed:", err.message);

    });
