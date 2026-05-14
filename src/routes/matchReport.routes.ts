import { Router } from "express";
import matchReportController from "../controllers/MatchReportController";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const router = Router();

router.use(authenticate);

router.get("/", matchReportController.getAll.bind(matchReportController));

router.get("/:id", matchReportController.getById.bind(matchReportController));

router.get(
  "/player/:playerId",
  matchReportController.getByPlayer.bind(matchReportController),
);

router.post("/", matchReportController.create.bind(matchReportController));

router.patch(
  "/:id",
  authorize("admin"),
  matchReportController.update.bind(matchReportController),
);

router.delete(
  "/:id",
  authorize("admin"),
  matchReportController.remove.bind(matchReportController),
);

export default router;
