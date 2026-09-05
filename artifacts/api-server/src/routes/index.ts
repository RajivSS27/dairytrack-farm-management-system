import { Router, type IRouter } from "express";
import dairyRouter from "./dairy";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dairyRouter);

export default router;
