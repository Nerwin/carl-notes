import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { config, getNoteFolderLocations, updateNoteFolderLocations } from '../configuration';
import { NoteFolderProvider } from '../providers/noteFolder.provider';
import { NoteRepository } from './note.repository';
import { NoteFolder } from '../models/noteFolder';
import logger from '../logger';

export class NoteFolderRepository {
  constructor(public settings: vscode.WorkspaceConfiguration) {
    this.settings = vscode.workspace.getConfiguration(config.extensionId);
  }

  static async linkNoteFolder(notesTree: NoteFolderProvider) {
    const openDialogOptions: vscode.OpenDialogOptions = {
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Select',
    };
    const fileUri = await vscode.window.showOpenDialog(openDialogOptions);

    if (fileUri?.length) {
      try {
        const noteFolderLocations = getNoteFolderLocations();
        noteFolderLocations.push(path.normalize(fileUri[0].fsPath));
        await updateNoteFolderLocations(noteFolderLocations);

        notesTree.refresh();
      } catch (err) {
        logger.error(err);
        vscode.window.showErrorMessage('Oops... an error occurred. Please try again');
      }
    }
  }

  static async unlinkNoteFolder(noteFolder: NoteFolder, tree: NoteFolderProvider) {
    const answer = await vscode.window.showWarningMessage(
      `Are you sure you want to unlink '${noteFolder.name}'? (It won't delete the folder)`,
      'Yes',
      'No',
    );

    if (answer === 'Yes') {
      try {
        const noteFolderLocations = getNoteFolderLocations();
        const noteFolderLocationsToKeep = noteFolderLocations.filter(n => n !== noteFolder.location);
        await updateNoteFolderLocations(noteFolderLocationsToKeep);
        vscode.window.showInformationMessage(`Successfully unlinked ${noteFolder.name}`);
        tree.refresh();
      } catch (err) {
        vscode.window.showErrorMessage(`Failed to unlink folder ${noteFolder.name}`);
      }
    }
  }

  static async openNoteFolder(noteFolder: NoteFolder) {
    const noteFolderUri = vscode.Uri.file(noteFolder.location);
    await vscode.commands.executeCommand('revealFileInOS', noteFolderUri);
  }

  static getNoteFolders(noteFolderLocations: string[]): NoteFolder[] {
    return noteFolderLocations.flatMap(noteFolderLocation => {
      if (!this._pathExists(noteFolderLocation)) return [];

      const notes = NoteRepository.getNotes(noteFolderLocation);

      return new NoteFolder(path.basename(noteFolderLocation), noteFolderLocation, vscode.TreeItemCollapsibleState.Collapsed, notes);
    });
  }

  private static _pathExists(path: string): boolean {
    try {
      fs.accessSync(path);
      return true;
    } catch (err) {
      return false;
    }
  }
}
