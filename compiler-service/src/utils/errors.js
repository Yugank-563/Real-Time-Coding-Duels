export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CompilationError extends AppError {
  constructor(message, compileOutput = '') {
    super(message, 400);
    this.compileOutput = compileOutput;
  }
}

export class ExecutionError extends AppError {
  constructor(message, verdict = 'RE') {
    super(message, 400);
    this.verdict = verdict;
  }
}
