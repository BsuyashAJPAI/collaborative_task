import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { prisma } from "./config/db";
import authRoutes from "./modules/auth/auth.routes";
import taskRoutes from "./modules/tasks/task.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Middleware
app.use(cors({
    origin: "http://localhost:5173", // Tightened for security
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// 2. Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/health", (req, res) => res.json({ status: "OK" }));

// 3. Create HTTP Server
const server = http.createServer(app);

// 4. Setup Socket.io (Exported so controllers can use it)
export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("⚓ Socket connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// 5. Connect Database & Start Server
prisma.$connect()
    .then(() => {
        console.log("✅ Database connected");
        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ DB connection failed", err);
        process.exit(1);
    });