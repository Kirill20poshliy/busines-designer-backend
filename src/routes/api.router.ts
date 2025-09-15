import { Router } from 'express';
import { authRouter } from './auth.router';
import { usersRouter } from './user.router'
import { authMiddleware } from '../middleware/auth.middleware';
import { projectsRouter } from './projects.router';
import { triggersRouter } from './triggerTypes.router'
import { processCategoriesRouter } from './processCategories.router';
import { docsRouter } from './documents.router';
import { filesRouter } from './files.router';

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", authMiddleware, usersRouter);
apiRouter.use("/projects", authMiddleware, projectsRouter);
apiRouter.use("/triggers", authMiddleware, triggersRouter);
apiRouter.use("/process_categories", authMiddleware, processCategoriesRouter);
apiRouter.use("/documents", authMiddleware, docsRouter);
apiRouter.use("/files", filesRouter)

export { apiRouter }