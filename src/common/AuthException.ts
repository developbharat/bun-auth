export class AuthException extends Error {
  constructor(public content: string, public code: number = 500) {
    super(content);
  }
}
