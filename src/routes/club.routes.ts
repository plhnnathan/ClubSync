import { Router } from "express";
import clubController from "../controllers/ClubController";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const router = Router();

router.use(authenticate);

router.get("/", clubController.getClub.bind(clubController));

router.get("/members", clubController.getMembers.bind(clubController));

router.patch(
  "/",
  authorize("admin"),
  clubController.updateClub.bind(clubController),
);

export default router;
