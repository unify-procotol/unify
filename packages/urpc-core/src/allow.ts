import { AuthUser } from "./types";

export class Allow {
  static everyone = (): boolean => true;

  static authenticated = (user?: AuthUser): boolean => {
    return !!user;
  };

  static hasRole =
    (role: string) =>
    (user: AuthUser | null): boolean => {
      return !!user?.roles?.includes(role);
    };

  static hasAnyRole =
    (roles: string[]) =>
    (user: AuthUser | null): boolean => {
      return !!user?.roles?.some((role: string) => roles.includes(role));
    };
}
