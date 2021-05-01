import * as vscode from 'vscode';

import { NoteFolderRepository } from '../repositories/noteFolder.repository';
import { getNoteFolderLocations } from '../configuration';
import { NoteFolder } from '../models/noteFolder';
import { Note } from '../models/note';

export class NoteFolderProvider implements vscode.TreeDataProvider<NoteFolder | Note> {
  private _onDidChangeTreeData: vscode.EventEmitter<NoteFolder | Note | undefined> = new vscode.EventEmitter<
    NoteFolder | Note | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<NoteFolder | Note | undefined> = this._onDidChangeTreeData.event;

  constructor(private noteFolderLocations: string[]) {}

  public init(): NoteFolderProvider {
    this.refresh();
    return this;
  }

  refreshNoteFolderLocations() {
    this.noteFolderLocations = getNoteFolderLocations();
  }

  refresh(): void {
    this.refreshNoteFolderLocations();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(noteFolder: NoteFolder): vscode.TreeItem {
    return noteFolder;
  }

  async getChildren(noteFolder?: NoteFolder): Promise<NoteFolder[] | Note[]> {
    if (!this.noteFolderLocations) return [];

    if (noteFolder) {
      return noteFolder.notes;
    }

    return NoteFolderRepository.getNoteFolders(this.noteFolderLocations);
  }
}
