import { config } from './configuration';

class Logger {
  info(...args: any[]) {
    console.log(`[${config.extensionName}]`, ...args);
  }

  error(...args: any[]) {
    console.error(`[${config.extensionName}]`, ...args);
  }
}

export default new Logger();
