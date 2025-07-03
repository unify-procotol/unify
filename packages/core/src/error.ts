export interface ErrorResponse {
  code: number;
  message: string;
}

export class UnifyError extends Error implements ErrorResponse {
  public name: string = "UnifyError";
  public code: number;
  public message: string;

  constructor(code: number, message: string) {
    super();
    this.code = code;
    this.message = message;
  }
}

export const ErrorCodes = {
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
} as const;
