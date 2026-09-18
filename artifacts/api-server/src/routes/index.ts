import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(authRouter);

export default router;
