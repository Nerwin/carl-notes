import * as vscode from 'vscode';
import * as path from 'path';
import * as gl from 'glob';
import * as fs from 'fs';

import { Note } from '../models/note';
import { config } from '../configuration';
import { NoteFolder } from '../models/noteFolder';

export class NotesProvider implements vscode.TreeDataProvider<NoteFolder | Note> {
  private _onDidChangeTreeData: vscode.EventEmitter<NoteFolder | Note | undefined> = new vscode.EventEmitter<
    NoteFolder | Note | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<NoteFolder | Note | undefined> = this._onDidChangeTreeData.event;

  // assign notes location passed to NoteFoldersProvider
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
  getTreeItem(noteFolder: NoteFolder): vscode.TreeItem {
    return noteFolder;
  }

  // get children from notes location
  async getChildren(noteFolder?: NoteFolder): Promise<NoteFolder[] | Note[]> {
    // if tree provider wasn't given a notes location to check
    if (!this.notesLocations) {
      return [];
    }
    // if we get a note return resolved promise
    if (noteFolder) {
      return noteFolder.notes;
    }
    // else return list of notes in notes location
    else {
      return this.getNoteFolders(this.notesLocations);
    }
  }

  // get Notes from notes location
  getNoteFolders(notesLocations: string[]): NoteFolder[] {
    return notesLocations.flatMap(notesLocation => {
      if (!this.pathExists(notesLocation)) return [];

      const notes = this.getNotes(notesLocation);

      return new NoteFolder(path.basename(notesLocation), notesLocation, vscode.TreeItemCollapsibleState.Collapsed, notes);

      // const notes = config.allowedFileExtensions.flatMap(fileExtension => {
      //   return gl.sync(`*.${fileExtension}`, { cwd: notesLocation, nodir: true, nocase: true }).map(listOfNotes);
      // });

      // return notes;
    });
  }

  // get Notes from notes location
  getNotes(notesLocation: string): Note[] {
    if (!this.pathExists(notesLocation)) return [];

    const listOfNotes = (note: string): Note => {
      // return a Note, when a note is clicked on in the view, perform a command
      return new Note(path.basename(note), notesLocation, {
        command: 'cnotes.openNote',
        title: '',
        arguments: [note],
      });
    };

    const notes = config.allowedFileExtensions.flatMap(fileExtension => {
      return gl.sync(`*.${fileExtension}`, { cwd: notesLocation, nodir: true, nocase: true }).map(listOfNotes);
    });

    return notes;
  }

  private pathExists(path: string): boolean {
    try {
      fs.accessSync(path);
      return true;
    } catch (err) {
      return false;
    }
  }
}
