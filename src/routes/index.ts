import { Router } from "express";

import { CalculationRouter } from "./calculation";

const router = Router();

router.use("/calculates", CalculationRouter);

export default router;
