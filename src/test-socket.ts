import "dotenv";
import io from "socket.io-client";
import http from "http";
import { IDocument } from "./models/document.model";

http.get(`http://localhost:8082/health`, (res) => {
    console.log("✅ HTTP Server status:", res.statusCode);
    res.on("data", (data) => console.log("📊 Health check:", data.toString()));
}).on("error", (err) => {
    console.error("❌ HTTP Server not available:", err.message);
});

setTimeout(() => {
    console.log("🔌 Testing WebSocket connection...");

    const socket = io("http://localhost:8082", {
        transports: ["websocket"],
        autoConnect: true,
    });

    socket.on("connect", () => {
        console.log("✅ Connected to Socket.IO server");
        socket.emit("join-document", "1");
    });

    socket.on("document-content", (data: IDocument) => {
        console.log("📨 Received document content:", data);
        socket.emit('document-update', {documentId: '1', content: '{"nodes": []}'})
    });

    socket.on("connect_error", (error: {message: string}) => {
        console.error("❌ Connection error:", error.message);
    });

    socket.on("error", (error: {message: string}) => {
        console.error("❌ Action error:", error.message);
    });

    socket.on("disconnect", (reason: string) => {
        console.log("🔌 Disconnected:", reason);
    });

}, 1000);
