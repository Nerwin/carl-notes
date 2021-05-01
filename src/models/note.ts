import * as vscode from 'vscode';

export class Note extends vscode.TreeItem {
  constructor(public readonly name: string, public readonly location: string, public command?: vscode.Command) {
    super(name);

    this.name = name;
    this.location = location;
    this.iconPath = new vscode.ThemeIcon('output');
    this.tooltip = `${this.name}`;
  }

  contextValue = 'note';
}
