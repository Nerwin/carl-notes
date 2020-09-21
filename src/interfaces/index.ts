import { LogLevels } from 'npmlog';

export interface Settings {
  extensionId: string;
  extensionName: string;
  logLevel: LogLevels;
  allowedFileExtensions: string[];
}
