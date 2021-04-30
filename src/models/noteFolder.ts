import * as vscode from 'vscode';
import * as path from 'path';

import { Note } from './note';

export class NoteFolder extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly location: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly notes: Note[],
  ) {
    super(name, collapsibleState);
    this.name = name;
    this.location = location;
    this.notes = notes;
    this.iconPath = {
      light: path.join(__dirname, '..', '..', 'resources', 'light', 'note.svg'),
      dark: path.join(__dirname, '..', '..', 'resources', 'dark', 'note.svg'),
    };

    this.tooltip = `Note folder:${this.name}`;
    this.description = `Folder: ${this.name}`;
  }

  contextValue = 'noteFolder';
}
