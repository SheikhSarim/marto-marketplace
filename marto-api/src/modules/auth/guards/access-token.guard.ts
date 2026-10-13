import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { ConfigType } from "@nestjs/config";
import { Request } from "express";
import jwtConfig from "../config/jwt.config";
import { REQUEST_USER_KEY } from "../constants/auth.constants";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Cookie se access token lo
    // Agar cookie mein nahi hai to Authorization header se fallback
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Token not found.");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
      });

      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new UnauthorizedException("Invalid or expired token.");
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    // 1. Cookie se token
    const cookieToken = request.cookies?.access_token;

    if (cookieToken) {
      return cookieToken;
    }

    // 2. Authorization header fallback
    const [type, token] =
      request.headers.authorization?.split(" ") ?? [];

    if (type === "Bearer" && token) {
      return token;
    }

    return undefined;
  }
}
