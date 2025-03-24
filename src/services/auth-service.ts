import bcrypt from "bcrypt";
import prisma from "../config/db";
import jwt from "jsonwebtoken";
import { PrivateResultType } from "@prisma/client/runtime/library";

interface UserData {
  name: string;
  email: string;
  password: string;
  country: string;
  currency: string;
}

export class AuthService {
  async register(userData: UserData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        country: userData.country,
        currency: userData.currency,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    const token = this.generateToken(user.id);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("Invalid Creditionals");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error(" Invalid Creditionals");
    }

    const { passwordHash, ...userWithoutPassword } = user;
    const token = this.generateToken(user.id);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  private generateToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });
  }
}
