import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { NotesProvider } from '../providers/notes.provider';
import { config } from '../configuration';
import { Note } from '../models/note';

const fileExtensionRegex = /(\..{2,8}$)/gm;

export class NoteRepository {
  constructor(public settings: vscode.WorkspaceConfiguration) {
    this.settings = vscode.workspace.getConfiguration(config.extensionId);
  }

  // get notes storage location
  static getNotesLocations(): string[] {
    return vscode.workspace.getConfiguration(config.extensionShortName).get<string[]>('notesLocations') ?? [];
  }

  static getDefaultFileExtension(): string {
    return vscode.workspace.getConfiguration(config.extensionShortName).get<string>('defaultFileExtension') || '.md';
  }

  // delete note
  static deleteNote(note: Note, tree: NotesProvider): void {
    // prompt user for confirmation
    vscode.window
      .showWarningMessage(`Are you sure you want to delete '${note.name}'? This action is permanent and can not be reversed.`, 'Yes', 'No')
      .then(result => {
        // if the user answers Yes
        if (result === 'Yes') {
          // try to delete the note
          fs.unlink(path.join(String(note.location), String(note.name)), err => {
            // if there was an error deleting the note
            if (err) {
              // report error
              console.error(err);
              return vscode.window.showErrorMessage(`Failed to delete ${note.name}.`);
            }
            // else let the user know the file was deleted successfully
            return vscode.window.showInformationMessage(`Successfully deleted ${note.name}.`);
          });
          // refresh tree after deleting note
          tree.refresh();
        }
      });
  }

  // list notes
  static listNotes(): void {
    const notesLocations = NoteRepository.getNotesLocations();

    notesLocations.forEach(notesLocation => {
      // read files in storage location
      fs.readdir(String(notesLocation), (err, files) => {
        if (err) {
          // report error
          console.error(err);
          return vscode.window.showErrorMessage('Failed to read the notes folder.');
        } else {
          // show list of notes
          return vscode.window.showQuickPick(files).then(file => {
            // open selected note
            vscode.window.showTextDocument(vscode.Uri.file(path.join(String(notesLocation), String(file))));
          });
        }
      });
    });
  }

  // new note
  static async newNote(tree: NotesProvider) {
    // TODO: Change to have default folder in config
    const notesLocation = String(this.getNotesLocations()[0]);

    const noteName = await vscode.window.showInputBox({
      prompt: 'Note name?',
      value: '',
    });

    noteName?.trim();
    if (!noteName) return vscode.window.showErrorMessage('Invalid name');

    const hasExtension = noteName.match(fileExtensionRegex);
    const fileName = hasExtension ? noteName : `${noteName}${this.getDefaultFileExtension()}`;
    const filePath: string = path.join(String(notesLocation), `${fileName.replace(/\:/gi, '')}`);

    const noteExists = fs.existsSync(filePath);
    if (noteExists) return vscode.window.showWarningMessage('A note with that name already exists.');

    fs.writeFile(filePath, '', err => {
      if (err) {
        console.error(err);
        return vscode.window.showErrorMessage('Failed to create the new note.');
      } else {
        const file = vscode.Uri.file(filePath);
        return vscode.window.showTextDocument(file).then(() => {
          vscode.commands.executeCommand('cursorMove', { to: 'viewPortBottom' });
        });
      }
    });
    tree.refresh();
  }

  static openNote(note: Note): void {
    // TODO: Change to have the current folder location
    const notesLocation = String(NoteRepository.getNotesLocations()[0]);
    vscode.window.showTextDocument(vscode.Uri.file(path.join(String(notesLocation), String(note))));
  }

  static refreshNotes(tree: NotesProvider): void {
    tree.refresh();
  }

  static async renameNote(note: Note, tree: NotesProvider) {
    const noteName = await vscode.window.showInputBox({
      prompt: 'New note name?',
      value: note.name,
    });

    noteName?.trim();
    if (!noteName || noteName === note.name) {
      return;
    }

    // TODO: validate file extension or add one
    const newNoteName = noteName;

    // check for existing note with the same name
    const newNotePath = path.join(note.location, newNoteName);
    if (fs.existsSync(newNotePath)) {
      return vscode.window.showWarningMessage(`'${newNoteName}' already exists.`);
    }

    vscode.window.showInformationMessage(`'${note.name}' renamed to '${newNoteName}'.`);
    fs.renameSync(path.join(note.location, note.name), newNotePath);

    tree.refresh();
    return;
  }

  // setup notes
  static setupNotes(): void {
    // dialog options
    const openDialogOptions: vscode.OpenDialogOptions = {
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Select',
    };

    // display open dialog with above options
    vscode.window.showOpenDialog(openDialogOptions).then(fileUri => {
      if (fileUri && fileUri[0]) {
        // get Notes configuration
        const notesConfiguration = vscode.workspace.getConfiguration('Notes');
        // update Notes configuration with selected location
        notesConfiguration.update('notesLocation', path.normalize(fileUri[0].fsPath), true).then(() => {
          // prompt to reload window so storage location change can take effect
          vscode.window
            .showWarningMessage('You must reload the window for the storage location change to take effect.', 'Reload')
            .then(selectedAction => {
              // if the user selected to reload the window then reload
              if (selectedAction === 'Reload') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
              }
            });
        });
      }
    });
  }
}
