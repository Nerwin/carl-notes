import * as vscode from 'vscode';

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
    this.iconPath = new vscode.ThemeIcon('folder-opened');
    this.tooltip = `${this.name}`;
  }

  contextValue = 'noteFolder';
}
