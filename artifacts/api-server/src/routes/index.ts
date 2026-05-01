import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import staffRouter from "./staff";
import adminUsersRouter from "./adminUsers";
import dietPlansRouter from "./dietPlans";
import templatesRouter from "./templates";
import photosRouter from "./photos";
import progressLogsRouter from "./progressLogs";
import paymentsRouter from "./payments";
import dashboardRouter from "./dashboard";
import supportTeamRouter from "./supportTeam";
import { authRouter } from "../auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter());
router.use(clientsRouter);
router.use(staffRouter);
router.use(adminUsersRouter);
router.use(dietPlansRouter);
router.use(templatesRouter);
router.use(photosRouter);
router.use(progressLogsRouter);
router.use(paymentsRouter);
router.use(dashboardRouter);
router.use(supportTeamRouter);

export default router;
