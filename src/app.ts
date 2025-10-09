import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions, swaggerUiOptions } from "./docs/swagger";
import swaggerJsdoc from "swagger-jsdoc";
import { initializeDatabase } from "./db";
import { apiRouter } from "./routes/api.router";
import cookieParser from "cookie-parser";
import path from "path";
import { createServer } from "http";
import socketService from "./services/socket.service";
import { AgentsManager } from "./agents/agentsManager";

const app = express();
const server = createServer(app);

const cookieSecret = process.env.COOKIES_KEY || "cookie-sign";
const projectRoot = path.resolve(__dirname, "../..");

// const agentsManager = new AgentsManager();
const agentsManager = AgentsManager.getInstance();

app.use(cookieParser(cookieSecret));
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ 
        status: 'OK', 
        websocket: 'available',
        timestamp: new Date().toISOString()
    });
});

app.use("/api", apiRouter);
app.use("/uploads", express.static(path.join(projectRoot, "uploads")));

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

socketService.initialize(server);

const startServer = async () => {
    try {
        await initializeDatabase();

        const HOST = process.env.HOST || "http://localhost";
        const PORT = process.env.PORT || 8080;

        console.log('🔄 Initializing Agents Manager...');
        await agentsManager.initialize();
        console.log('✅ Agents Manager initialized successfully');

        server.listen(PORT, () => {
            console.log(`🖥️  Server is running on ${HOST}:${PORT}`);
            console.log(`🕹️  Api aviailable at ${HOST}:${PORT}/api`);
            console.log(
                `📜 Swagger docs available at ${HOST}:${PORT}/api-docs`
            );
            console.log(`🔌 WebSocket available at ${HOST}:${PORT}`);
            console.log(`🤖 Agent Manager started - monitoring database agents`);

            const agentsStatus = agentsManager.getAgentsStatus();
            const activeAgents = agentsStatus.filter(a => a.isStarted);

            console.log(`📊 Loaded ${agentsStatus.length} agents, ${activeAgents.length} active`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};

startServer();
