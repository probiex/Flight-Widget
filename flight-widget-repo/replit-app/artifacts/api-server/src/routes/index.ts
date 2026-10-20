import { Router, type IRouter } from "express";
import flightDataRouter from "./flight-data";
import healthRouter from "./health";
import airportResourcesRouter from "./airport-resources";
import airportConditionsRouter from "./airport-conditions";
import travelToolsRouter from "./travel-tools";
import dataSourcesRouter from "./data-sources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(flightDataRouter);
router.use(airportResourcesRouter);
router.use(airportConditionsRouter);
router.use(travelToolsRouter);
router.use(dataSourcesRouter);

export default router;
