import winston from 'winston';
import 'winston-mongodb';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),

    new winston.transports.MongoDB({
      level: process.env.LOG_LEVEL,
      db: process.env.MONGODB_URL,
    //   options: { useUnifiedTopology: true },
      collection: 'ReNexa_Event_logs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })

  ]
});


logger.on('error', (err) => {
  console.error('Winston logging error:', err);
});

export default logger;