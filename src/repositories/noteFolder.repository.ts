import * as vscode from 'vscode';

import { NotesProvider } from '../providers/notes.provider';
import { config } from '../configuration';
import { NoteFolder } from '../models/noteFolder';

export class NoteFolderRepository {
  constructor(public settings: vscode.WorkspaceConfiguration) {
    this.settings = vscode.workspace.getConfiguration(config.extensionId);
  }

  // delete note
  static deleteNoteFolder(noteFolder: NoteFolder, tree: NotesProvider): void {
    // prompt user for confirmation

    vscode.window.showWarningMessage(`Are you sure you want to unlink '${noteFolder.name}'?`, 'Yes', 'No').then(result => {
      // if the user answers Yes
      // if (result === 'Yes') {
      //   // try to delete the note
      //   fs.unlink(path.join(String(note.location), String(note.name)), err => {
      //     // if there was an error deleting the note
      //     if (err) {
      //       // report error
      //       console.error(err);
      //       return vscode.window.showErrorMessage(`Failed to delete ${note.name}.`);
      //     }
      //     // else let the user know the file was deleted successfully
      //     vscode.window.showInformationMessage(`Successfully deleted ${note.name}.`);
      //   });
      // refresh tree after deleting note
      tree.refresh();
    });
  }
}
