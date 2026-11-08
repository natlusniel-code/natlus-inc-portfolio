export class HttpError extends Error {
  status: number;
  missingEnv: string[];

  constructor(status: number, message: string, missingEnv: string[] = []) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.missingEnv = missingEnv;
  }
}
