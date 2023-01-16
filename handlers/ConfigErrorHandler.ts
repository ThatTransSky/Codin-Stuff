export class ConfigErrorHandler extends Error {
  public message: string;
  public code: string | number;
  constructor(message: string, code: string | number) {
    super();
    this.message = message;
    this.name = 'ConfigErrorHandler';
    this.code = code;
  }
}
