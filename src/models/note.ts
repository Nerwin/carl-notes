import * as vscode from 'vscode';
import * as path from 'path';

export class Note extends vscode.TreeItem {
  constructor(public readonly name: string, public readonly location: string, public readonly command?: vscode.Command) {
    super(name);

    this.name = name;
    this.location = location;
    this.iconPath = {
      light: path.join(__dirname, '..', '..', 'resources', 'light', 'note.svg'),
      dark: path.join(__dirname, '..', '..', 'resources', 'dark', 'note.svg'),
    };

    this.tooltip = `${this.name}`;
    this.description = `Note: ${this.name}`;
  }

  contextValue = 'note';
}
