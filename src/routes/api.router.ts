import { Router } from 'express';
import { authRouter } from './auth.router';
import { usersRouter } from './user.router'
import { authMiddleware } from '../middleware/auth.middleware';
import { projectsRouter } from './projects.router';
import { docsRouter } from './documents.router';

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", authMiddleware, usersRouter);
apiRouter.use("/projects", authMiddleware, projectsRouter);
apiRouter.use("/documents", authMiddleware, docsRouter);

export { apiRouter }