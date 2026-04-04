import { Router, type IRouter } from "express";
import healthRouter from "./health";
import settingsRouter from "./settings";
import sectionsRouter from "./sections";
import contactRouter from "./contact";
import colorsRouter from "./colors";

const router: IRouter = Router();

router.use(healthRouter);
router.use(settingsRouter);
router.use(sectionsRouter);
router.use(contactRouter);
router.use(colorsRouter);

export default router;
