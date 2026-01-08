import winston from 'winston';

const logger = winston.createLogger({
format: format.combine(
	format.timestamp(),
	format.json()
),
transports: [
	new transports.Console()
]
});