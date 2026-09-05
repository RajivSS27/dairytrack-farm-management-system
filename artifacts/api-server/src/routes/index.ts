import { Router, type IRouter } from "express";
import dairyRouter from "./dairy";
import fieldOperationsRouter from "./field-operations";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dairyRouter);
router.use(fieldOperationsRouter);

export default router;
