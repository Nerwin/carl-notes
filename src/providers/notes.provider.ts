import * as vscode from 'vscode';
import * as path from 'path';
import * as gl from 'glob';
import * as fs from 'fs';

import { Note } from '../models/note';
import { config } from '../configuration';

export class NotesProvider implements vscode.TreeDataProvider<Note> {
  private _onDidChangeTreeData: vscode.EventEmitter<Note | undefined> = new vscode.EventEmitter<Note | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Note | undefined> = this._onDidChangeTreeData.event;

  // assign notes location passed to NotesProvider
  constructor(private notesLocations: string[]) {}

  public init(): NotesProvider {
    this.refresh();
    return this;
  }

  // refresh tree if tree data changed
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  // get TreeItem representation of a note
  getTreeItem(note: Note): vscode.TreeItem {
    return note;
  }

  // get children from notes location
  getChildren(note?: Note): Thenable<Note[]> {
    // if tree provider wasn't given a notes location to check
    if (!this.notesLocations) {
      return Promise.resolve([]);
    }
    // if we get a note return resolved promise
    if (note) {
      return Promise.resolve([]);
    }
    // else return list of notes in notes location
    else {
      return Promise.resolve(this.getNotes(this.notesLocations));
    }
  }

  // get Notes from notes location
  getNotes(notesLocations: string[]): Note[] {
    return notesLocations.flatMap(notesLocation => {
      if (!this.pathExists(notesLocation)) return [];

      const listOfNotes = (note: string): Note => {
        // return a Note, when a note is clicked on in the view, perform a command
        return new Note(path.basename(note), notesLocation, vscode.TreeItemCollapsibleState.None, {
          command: 'cnotes.openNote',
          title: '',
          arguments: [note],
        });
      };

      const notes = config.allowedFileExtensions.flatMap(fileExtension => {
        return gl.sync(`*.${fileExtension}`, { cwd: notesLocation, nodir: true, nocase: true }).map(listOfNotes);
      });

      return notes;
    });
  }

  // check to see if the given path exists in the file system
  private pathExists(p: string): boolean {
    // try accessing the given location
    try {
      fs.accessSync(p);
      // error if we can't access given location
    } catch (err) {
      // return false if location does not exist
      return false;
    }
    // return true if location exists
    return true;
  }
}
