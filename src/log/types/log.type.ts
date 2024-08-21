export enum LogContextType {
  USER_REQUEST = 'USER_REQUEST',
  SYSTEM = 'SYSTEM',
}

export enum LogLevelType {
  error = 'error', // 1
  warn = 'warn', // 2
  info = 'info', // 3
  silly = 'silly', // 4
}

export enum LogStatusCodeType {
  INFORMATIONAL = 'INFORMATIONAL', // 100번대
  SUCCESS = 'SUCCESS', // 200번대
  REDIRECTION = 'REDIRECTION', // 300번대
  CLIENT_ERROR = 'CLIENT_ERROR', // 400번대
  SERVER_ERROR = 'SERVER_ERROR', // 500번대
}

export enum LogMethodType {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
