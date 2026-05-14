import { AuthService } from "../services/AuthService";
import User from "../models/User";
import Club from "../models/Clube";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../models/User");
jest.mock("../models/Clube");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const authService = new AuthService();

const mockClub = {
  _id: "6a0644df8b6eb3e954e3489f",
  name: "FC ClubSync",
  slug: "fc-clubsync",
};

const mockUser = {
  _id: "6a0644e08b6eb3e954e348a0",
  name: "Nathan Admin",
  email: "nathan@clubsync.com",
  password: "hashed_password",
  role: "admin",
  clubId: mockClub._id,
};

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
    process.env.JWT_EXPIRES_IN = "8h";
  });

  describe("register", () => {
    it("should register a new admin and return a token", async () => {
      jest.mocked(User.findOne).mockResolvedValue(null);
      jest.mocked(Club.create).mockResolvedValue(mockClub as any);
      jest.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
      jest.mocked(User.create).mockResolvedValue(mockUser as any);
      jest.mocked(jwt.sign).mockReturnValue("mock_token" as any);

      const result = await authService.register({
        name: "Nathan Admin",
        email: "nathan@clubsync.com",
        password: "123456",
        clubName: "FC ClubSync",
      });

      expect(result.token).toBe("mock_token");
      expect(result.user.email).toBe("nathan@clubsync.com");
    });

    it("should throw an error when email is already in use", async () => {
      jest.mocked(User.findOne).mockResolvedValue(mockUser as any);

      await expect(
        authService.register({
          name: "Another User",
          email: "nathan@clubsync.com",
          password: "123456",
          clubName: "Another Club",
        }),
      ).rejects.toThrow("Email already in use");
    });
  });

  describe("login", () => {
    it("should login and return a token with valid credentials", async () => {
      jest.mocked(User.findOne).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      } as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jest.mocked(jwt.sign).mockReturnValue("mock_token" as any);

      const result = await authService.login({
        email: "nathan@clubsync.com",
        password: "123456",
      });

      expect(result.token).toBe("mock_token");
    });

    it("should throw an error when password is invalid", async () => {
      jest.mocked(User.findOne).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      } as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: "nathan@clubsync.com",
          password: "wrong_password",
        }),
      ).rejects.toThrow("Invalid credentials");
    });
  });
});
