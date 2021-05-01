import { promisify } from 'util';
import * as vscode from 'vscode';
import * as path from 'path';
import * as gl from 'glob';
import * as fs from 'fs';

import { config, getNoteFolderLocations, getDefaultFileExtension, getAllowedFileExtensions } from '../configuration';
import { NoteFolderProvider } from '../providers/noteFolder.provider';
import { NoteFolderRepository } from './noteFolder.repository';
import { NoteFolder } from '../models/noteFolder';
import commands from '../configuration/commands';
import { Note } from '../models/note';
import logger from '../logger';

const unlinkAsync = promisify(fs.unlink);
const fileExtensionRegex = /(\..{2,8}$)/gm;

export class NoteRepository {
  constructor(public settings: vscode.WorkspaceConfiguration) {
    this.settings = vscode.workspace.getConfiguration(config.extensionId);
  }

  static async deleteNote(note: Note, tree: NoteFolderProvider): Promise<void> {
    const answer = await vscode.window.showWarningMessage(
      `Are you sure you want to delete '${note.name}'? This action is permanent and can not be reversed`,
      'Yes',
      'No',
    );

    if (answer === 'Yes') {
      try {
        await unlinkAsync(note.location);
        vscode.window.showInformationMessage(`Successfully deleted ${note.name}`);
        tree.refresh();
      } catch (err) {
        logger.error(err);
        vscode.window.showErrorMessage(`Failed to delete ${note.name}`);
      }
    }
  }

  static listNotes(): void {
    const noteFolderLocations = getNoteFolderLocations();

    const notesLocations = NoteFolderRepository.getNoteFolders(noteFolderLocations).flatMap(noteFolder => {
      return noteFolder.notes.map(n => n.location);
    });

    vscode.window.showQuickPick(notesLocations).then(noteLocation => {
      vscode.window.showTextDocument(vscode.Uri.file(noteLocation!));
    });
  }

  static getNotes(noteFolderLocation: string): Note[] {
    if (!this._pathExists(noteFolderLocation)) return [];

    const listOfNotes = (noteName: string): Note => {
      const noteLocation = path.join(noteFolderLocation, noteName);
      return new Note(noteName, noteLocation, {
        title: '',
        command: commands.openNote,
        arguments: [noteLocation],
      });
    };

    const notes = getAllowedFileExtensions().flatMap(fileExtension => {
      return gl.sync(`*.${fileExtension}`, { cwd: noteFolderLocation, nodir: true, nocase: true }).map(listOfNotes);
    });

    return notes;
  }

  static async newNote(noteFolder: NoteFolder, tree: NoteFolderProvider) {
    if (!noteFolder) {
      const noteFolderLocations = getNoteFolderLocations();

      const folderLocation = await vscode.window.showQuickPick(noteFolderLocations, {
        canPickMany: false,
        placeHolder: 'Select the storage location for the new note',
      });
      if (!folderLocation) return;

      noteFolder = { location: folderLocation } as NoteFolder;
    }

    const noteName = await vscode.window.showInputBox({
      prompt: 'Note name?',
      value: '',
    });

    noteName?.trim();
    if (!noteName) return;

    const noteFolderLocation = noteFolder.location;
    const hasExtension = noteName.match(fileExtensionRegex);
    const fileName = hasExtension ? noteName : `${noteName}.${getDefaultFileExtension()}`;
    const filePath: string = path.join(noteFolderLocation, `${fileName.replace(/\:/gi, '')}`);

    const noteExists = fs.existsSync(filePath);
    if (noteExists) vscode.window.showWarningMessage('A note with that name already exists');

    fs.writeFile(filePath, '', err => {
      if (err) {
        logger.error(err);
        return vscode.window.showErrorMessage('Failed to create the new note');
      }

      const file = vscode.Uri.file(filePath);
      vscode.window.showTextDocument(file).then(() => {
        vscode.commands.executeCommand('cursorMove', { to: 'viewPortBottom' });
      });
      return tree.refresh();
    });
  }

  static async openNote(noteLocation: string) {
    try {
      await vscode.window.showTextDocument(vscode.Uri.file(noteLocation));
    } catch (err) {
      logger.error(err);
    }
  }

  static refreshNoteFolders(tree: NoteFolderProvider): void {
    tree.refresh();
  }

  static async renameNote(note: Note, tree: NoteFolderProvider) {
    const newNoteName = await vscode.window.showInputBox({
      prompt: 'New note name?',
      value: note.name,
    });

    newNoteName?.trim();
    if (!newNoteName || newNoteName === note.name) {
      return;
    }

    try {
      const newNotePath = path.join(path.dirname(note.location), newNoteName);
      if (fs.existsSync(newNotePath)) {
        return vscode.window.showWarningMessage(`'${newNoteName}' already exists.`);
      }

      fs.renameSync(note.location, newNotePath);
      vscode.window.showInformationMessage(`'${note.name}' renamed to '${newNoteName}'.`);

      return tree.refresh();
    } catch (err) {
      logger.error(err);
    }
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
