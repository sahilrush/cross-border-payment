// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../../services/auth-service";
import { LoginUserDto, RegisterUserDto } from "../../types";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterUserDto = req.body;

      // Basic validation
      if (!userData.email || !userData.password || !userData.name) {
        res
          .status(400)
          .json({ error: "Name, email and password are required" });
        return;
      }

      const result = await this.authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to register user" });
      }
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginUserDto = req.body;

      // Basic validation
      if (!loginData.email || !loginData.password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const result = await this.authService.login(loginData);
      res.status(200).json(result);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to authenticate user" });
      }
    }
  }

  /**
   * Get the current user profile (requires auth)
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // User should be attached by auth middleware
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Don't send the password hash
      const { passwordHash, ...userWithoutPassword } = user;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get user profile" });
      }
    }
  }
}
