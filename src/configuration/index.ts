import { Settings as Configuration } from '../interfaces';

export const config: Configuration = {
  extensionId: 'carl-notes',
  extensionName: 'Carl Notes',
  allowedFileExtensions: ['md', 'ts', 'js', 'log', 'txt', 'sql', 'json', 'jsonc', 'yaml'],
  logLevel: 'verbose',
};
