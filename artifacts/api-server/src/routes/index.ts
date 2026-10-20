import { Router, type IRouter } from "express";
import flightDataRouter from "./flight-data";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(flightDataRouter);

export default router;
