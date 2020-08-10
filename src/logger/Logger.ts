import winston from 'winston';

const myFormat = winston.format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`);
export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    myFormat,
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
  level: 'debug',
});
