import { LogLevels } from 'npmlog';

export interface Settings {
  extensionId: string;
  extensionName: string;
  extensionShortName: string;
  logLevel: LogLevels;
  allowedFileExtensions: string[];
}
