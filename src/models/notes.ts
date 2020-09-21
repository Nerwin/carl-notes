import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { NotesProvider } from '../providers/notes.provider';
import { config } from '../configuration';
import { Note } from './note';

export class Notes {
  constructor(public settings: vscode.WorkspaceConfiguration) {
    this.settings = vscode.workspace.getConfiguration(config.extensionId);
  }

  // get notes storage location
  static getNotesLocations(): string[] {
    return vscode.workspace.getConfiguration('cnotes').get<string[]>('notesLocations') ?? [];
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
            vscode.window.showInformationMessage(`Successfully deleted ${note.name}.`);
          });
          // refresh tree after deleting note
          tree.refresh();
        }
      });
  }

  // list notes
  static listNotes(): void {
    const notesLocations = Notes.getNotesLocations();

    notesLocations.forEach(notesLocation => {
      // read files in storage location
      fs.readdir(String(notesLocation), (err, files) => {
        if (err) {
          // report error
          console.error(err);
          return vscode.window.showErrorMessage('Failed to read the notes folder.');
        } else {
          // show list of notes
          vscode.window.showQuickPick(files).then(file => {
            // open selected note
            vscode.window.showTextDocument(vscode.Uri.file(path.join(String(notesLocation), String(file))));
          });
        }
      });
    });
  }

  // new note
  static newNote(tree: NotesProvider): void {
    const notesLocation = String(Notes.getNotesLocations());
    // prompt user for a new note name
    vscode.window
      .showInputBox({
        prompt: 'Note name?',
        value: '',
      })
      .then(noteName => {
        // set note name
        const fileName = `${noteName}`;
        // set note path
        const filePath: string = path.join(String(notesLocation), `${fileName.replace(/\:/gi, '')}.md`);
        // set note first line
        const firstLine: string = '# ' + fileName + '\n\n';
        // does note exist already?
        const noteExists = fs.existsSync(String(filePath));
        // if user entered name then create new note
        if (noteName) {
          // if a note with name doesn't already exist
          if (!noteExists) {
            // try writing the file to the storage location
            fs.writeFile(filePath, firstLine, err => {
              if (err) {
                // report error
                console.error(err);
                return vscode.window.showErrorMessage('Failed to create the new note.');
              } else {
                // open file
                const file = vscode.Uri.file(filePath);
                vscode.window.showTextDocument(file).then(() => {
                  // go to last line in new file
                  vscode.commands.executeCommand('cursorMove', { to: 'viewPortBottom' });
                });
              }
            });
            // refresh tree after creating new note
            tree.refresh();
          } else {
            // report
            return vscode.window.showWarningMessage('A note with that name already exists.');
          }
        }
      });
  }

  // open note
  static openNote(note: Note): void {
    const notesLocation = String(Notes.getNotesLocations());
    // open note at location
    vscode.window.showTextDocument(vscode.Uri.file(path.join(String(notesLocation), String(note))));
  }

  // refresh notes
  static refreshNotes(tree: NotesProvider): void {
    // refresh tree
    tree.refresh();
  }

  // rename note
  static renameNote(note: Note, tree: NotesProvider): void {
    // prompt user for new note name
    vscode.window
      .showInputBox({
        prompt: 'New note name?',
        value: note.name,
      })
      .then(noteName => {
        // if no new note name or note name didn't change
        if (!noteName || noteName === note.name) {
          // do nothing
          return;
        }

        // set new not name (may do something special with file types in the future)
        const newNoteName = noteName;

        // check for existing note with the same name
        const newNotePath = path.join(note.location, newNoteName);
        if (fs.existsSync(newNotePath)) {
          vscode.window.showWarningMessage(`'${newNoteName}' already exists.`);
          // do nothing
          return;
        }

        // else save the note
        vscode.window.showInformationMessage(`'${note.name}' renamed to '${newNoteName}'.`);
        fs.renameSync(path.join(note.location, note.name), newNotePath);

        // refresh tree after renaming note
        tree.refresh();
      });
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
