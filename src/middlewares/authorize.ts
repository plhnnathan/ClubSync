import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User";

const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Access denied. Not authenticated." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
      return;
    }

    next();
  };
};

export default authorize;
