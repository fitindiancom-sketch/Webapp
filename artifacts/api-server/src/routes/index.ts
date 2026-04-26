import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import staffRouter from "./staff";
import dietPlansRouter from "./dietPlans";
import templatesRouter from "./templates";
import photosRouter from "./photos";
import progressLogsRouter from "./progressLogs";
import paymentsRouter from "./payments";
import dashboardRouter from "./dashboard";
import { authUserRouter } from "../auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authUserRouter());
router.use(clientsRouter);
router.use(staffRouter);
router.use(dietPlansRouter);
router.use(templatesRouter);
router.use(photosRouter);
router.use(progressLogsRouter);
router.use(paymentsRouter);
router.use(dashboardRouter);

export default router;
