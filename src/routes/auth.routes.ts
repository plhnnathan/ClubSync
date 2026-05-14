import { Router } from "express";
import authController from "../controllers/AuthController";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

router.post(
  "/analysts",
  authenticate,
  authorize("admin"),
  authController.createAnalyst.bind(authController),
);

export default router;
