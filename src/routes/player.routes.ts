import { Router } from "express";
import playerController from "../controllers/PlayerController";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const router = Router();

router.use(authenticate);

router.get("/", playerController.getAll.bind(playerController));

router.get("/:id", playerController.getById.bind(playerController));

router.get("/:id/stats", playerController.getStats.bind(playerController));

router.post(
  "/",
  authorize("admin"),
  playerController.create.bind(playerController),
);

router.patch(
  "/:id",
  authorize("admin"),
  playerController.update.bind(playerController),
);

router.delete(
  "/:id",
  authorize("admin"),
  playerController.remove.bind(playerController),
);

export default router;
