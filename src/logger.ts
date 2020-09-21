import { config } from './configuration';

class Logger {
  info(...args: any[]) {
    console.log(`[${config.extensionName} Console]`, ...args);
  }

  error(...args: any[]) {
    console.error(`[${config.extensionName} Console]`, ...args);
  }
}

export default new Logger();
