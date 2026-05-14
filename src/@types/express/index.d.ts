import { UserRole } from "../../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clubId: string;
        role: UserRole;
      };
    }
  }
}
