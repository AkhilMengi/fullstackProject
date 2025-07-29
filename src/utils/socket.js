const socketIO = require("socket.io");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: "http://localhost:5173", // Frontend origin
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);

        socket.on("joinChat", ({ currentUser, targetId }) => {
            if (!currentUser || !targetId) {
                console.warn("joinChat missing data:", { currentUser, targetId });
                return;
            }

            const roomId = [currentUser, targetId].sort().join("_");
            console.log("📩 joinChat event received:", { currentUser, targetId });
            socket.join(roomId);
        });

        socket.on("sendMessage", async ({ firstName, currentUser, targetId, text }) => {
            if (!currentUser || !targetId || !text) {
                console.warn("sendMessage missing data:", { currentUser, targetId, text });
                return;
            }

            const roomId = [currentUser, targetId].sort().join("_");
            console.log(`✉️ ${firstName}: ${text}`);

            //Saving the message in DB
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [currentUser, targetId] }
                })
                if (!chat) {
                    chat = new Chat({
                        participants: [currentUser, targetId],
                        messages
                    })
                }
                chat.messages.push({
                    senderId: currentUser,
                    text
                })
                await chat.save()
                io.to(roomId).emit("messageReceived", {
                    firstName,
                    text,
                    senderId: currentUser, // ✅ include sender info
                });

            } catch (err) {
                console.log(err)
            }
        });

        // Emit message with senderId so clients can distinguish


        socket.on("exitChat", ({ currentUser, targetId }) => {
            const roomId = [currentUser, targetId].sort().join("_");
            socket.leave(roomId);
            console.log(`🚪 ${socket.id} exited room: ${roomId}`);
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    });
};

module.exports = initializeSocket;
