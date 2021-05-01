import * as vscode from 'vscode';

export const config = {
  extensionId: 'carl-notes',
  extensionName: 'Carl Notes',
  extensionShortName: 'cnotes',
};

export async function updateNoteFolderLocations(noteFolderLocations: string[]) {
  await vscode.workspace.getConfiguration(config.extensionShortName).update('noteFolderLocations', noteFolderLocations, true);
}

export function getNoteFolderLocations(): string[] {
  return vscode.workspace.getConfiguration(config.extensionShortName).get<string[]>('noteFolderLocations')!;
}

export function getConfiguration() {
  return vscode.workspace.getConfiguration(config.extensionShortName);
}

export function getDefaultFileExtension(): string {
  const defaultExtension = vscode.workspace.getConfiguration(config.extensionShortName).get<string>('defaultFileExtension') || 'md';
  return defaultExtension.replace('.', '');
}

export function getAllowedFileExtensions(): string[] {
  return vscode.workspace.getConfiguration(config.extensionShortName).get<string[]>('allowedFileExtensions')!;
}
