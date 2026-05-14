import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Club from "../models/Clube";
import User, { IUser, UserRole } from "../models/User";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  clubName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  clubId: string;
  role: UserRole;
}

export class AuthService {
  async register(
    input: RegisterInput,
  ): Promise<{ token: string; user: Partial<IUser> }> {
    const { name, email, password, clubName } = input;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const slug = clubName.toLowerCase().replace(/\s+/g, "-");
    const club = await Club.create({ name: clubName, slug });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      clubId: club._id,
    });

    const token = this.generateToken({
      id: user._id.toString(),
      clubId: club._id.toString(),
      role: user.role,
    });

    return {
      token,
      user: { name: user.name, email: user.email, role: user.role },
    };
  }

  async login(
    input: LoginInput,
  ): Promise<{ token: string; user: Partial<IUser> }> {
    const { email, password } = input;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken({
      id: user._id.toString(),
      clubId: user.clubId.toString(),
      role: user.role,
    });

    return {
      token,
      user: { name: user.name, email: user.email, role: user.role },
    };
  }

  async createAnalyst(
    input: Omit<RegisterInput, "clubName">,
    clubId: string,
  ): Promise<Partial<IUser>> {
    const { name, email, password } = input;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "analyst",
      clubId,
    });

    return { name: user.name, email: user.email, role: user.role };
  }

  private generateToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}

export default new AuthService();
