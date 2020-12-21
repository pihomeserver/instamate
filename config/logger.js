const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, align, printf } = format;

const instamateFormat = printf(({ level, message, timestamp }) => {
  const ts = timestamp.slice(0, 19).replace('T', ' ');
  return `${ts} [${level}] ${message}`;
});

let logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    align(),
    instamateFormat
  ),
  transports: [
    new transports.Console()
  ]
});

module.exports = logger;