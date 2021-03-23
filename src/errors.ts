export class UniqueViolationError extends Error {
  status = 422;
}

export class UnauthorizedError extends Error {
  status = 401;

  constructor(public message = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends Error {
  status = 403;

  constructor(public message = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends Error {
  status = 404;

  constructor(public message = 'Not found') {
    super(message);
  }
}
