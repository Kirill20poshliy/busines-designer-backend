import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions, swaggerUiOptions } from "./docs/swagger";
import swaggerJsdoc from "swagger-jsdoc";
import { initializeDatabase } from "./db";
import { apiRouter } from "./routes/api.router";
import cookieParser from "cookie-parser"
import path from 'path';
import { createSuperuserFunc } from "./db/superuser.dev";

const app = express();

const cookieSecret = process.env.COOKIES_KEY || 'cookie-sign'
const projectRoot = path.resolve(__dirname, '../..');

app.use(cookieParser(cookieSecret))
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

app.use("/api", apiRouter);
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

const startServer = async () => {
    try {
        await initializeDatabase();
        await createSuperuserFunc();

        const HOST = process.env.HOST || 'http://localhost'
        const PORT = process.env.PORT || 8080;

        app.listen(PORT, () => {
            console.log(`🖥️  Server is running on ${HOST}:${PORT}`);
            console.log(`🕹️  Api aviailable at ${HOST}:${PORT}/api`)
            console.log(
                `📜 Swagger docs available at ${HOST}:${PORT}/api-docs`
            );
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

startServer();

