import jwt from "jsonwebtoken";
import { AuthUser } from "@unilab/urpc-core";

// JWT configuration
interface JWTConfig {
  secret: string;
  expiresIn?: string | number;
  issuer?: string;
  audience?: string | string[];
}

// JWT payload interface
interface JWTPayload extends AuthUser {
  [key: string]: any;
}

// JWT decoded result interface
interface JWTDecodeResult {
  success: boolean;
  payload?: JWTPayload;
  error?: string;
}

class JWTUtils {
  private config: JWTConfig;

  constructor(config: JWTConfig) {
    this.config = {
      expiresIn: "24h",
      issuer: "auth-service",
      audience: "auth-client",
      ...config,
    };
  }

  /**
   * Generate JWT token
   * @param payload - The payload to encode in the token
   * @returns Generated JWT token string
   */
  generateToken(payload: JWTPayload): string {
    try {
      const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
      };

      const options = {
        expiresIn: this.config.expiresIn,
        issuer: this.config.issuer,
        audience: this.config.audience,
      };

      return jwt.sign(
        tokenPayload,
        this.config.secret,
        options as jwt.SignOptions
      );
    } catch (error) {
      throw new Error(
        `Failed to generate token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Verify and decode JWT token
   * @param token - The JWT token to decode
   * @returns Decoded payload or error information
   */
  verifyToken(token: string): JWTDecodeResult {
    try {
      const options = {
        issuer: this.config.issuer,
        audience: this.config.audience,
      };

      const decoded = jwt.verify(
        token,
        this.config.secret,
        options as jwt.VerifyOptions
      ) as JWTPayload;

      return {
        success: true,
        payload: decoded,
      };
    } catch (error) {
      let errorMessage = "Unknown error";

      if (error instanceof jwt.TokenExpiredError) {
        errorMessage = "Token has expired";
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = "Invalid token";
      } else if (error instanceof jwt.NotBeforeError) {
        errorMessage = "Token not active";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Decode JWT token without verification (for debugging purposes)
   * @param token - The JWT token to decode
   * @returns Decoded payload without verification
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error(
        `Failed to decode token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Refresh token by generating a new one with the same payload
   * @param token - The existing token to refresh
   * @returns New JWT token or null if original token is invalid
   */
  refreshToken(token: string): string | null {
    const verifyResult = this.verifyToken(token);

    if (!verifyResult.success || !verifyResult.payload) {
      return null;
    }

    // Remove JWT specific fields before regenerating
    const { iat, exp, iss, aud, ...payload } = verifyResult.payload;

    return this.generateToken(payload as JWTPayload);
  }

  /**
   * Check if token is expired
   * @param token - The JWT token to check
   * @returns true if token is expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

// Default JWT instance with environment variable or default secret
const defaultSecret =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

export const jwtUtils = new JWTUtils({
  secret: defaultSecret,
  expiresIn: "24h",
  issuer: "auth-service",
  audience: "auth-client",
});

// Export utility functions for direct use
export const generateToken = (payload: JWTPayload): string => {
  return jwtUtils.generateToken(payload);
};

export const verifyToken = (token: string): JWTDecodeResult => {
  return jwtUtils.verifyToken(token);
};

export const decodeToken = (token: string): AuthUser => {
  return jwtUtils.decodeToken(token);
};

export const refreshToken = (token: string): string | null => {
  return jwtUtils.refreshToken(token);
};

export const isTokenExpired = (token: string): boolean => {
  return jwtUtils.isTokenExpired(token);
};

// Export types and class for advanced usage
export { JWTUtils };
export type { JWTConfig, JWTPayload, JWTDecodeResult };
