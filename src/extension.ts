import * as vscode from 'vscode';

import { NoteFolderRepository } from './repositories/noteFolder.repository';
import { config, getNoteFolderLocations } from './configuration';
import { NoteRepository } from './repositories/note.repository';
import { NoteFolderProvider } from './providers/noteFolder.provider';
import { NoteFolder } from './models/noteFolder';
import commands from './configuration/commands';
import { Note } from './models/note';
import logger from './logger';

function registerAllCommands(context: vscode.ExtensionContext, notesTree: NoteFolderProvider) {
  const deleteNoteDisposable = vscode.commands.registerCommand(commands.deleteNote, (note: Note) => {
    NoteRepository.deleteNote(note, notesTree);
  });
  context.subscriptions.push(deleteNoteDisposable);

  const listNotesDisposable = vscode.commands.registerCommand(commands.listNotes, () => {
    NoteRepository.listNotes();
  });
  context.subscriptions.push(listNotesDisposable);

  const newNoteDisposable = vscode.commands.registerCommand(commands.newNote, (noteFolder: NoteFolder) => {
    NoteRepository.newNote(noteFolder, notesTree);
  });
  context.subscriptions.push(newNoteDisposable);

  const openNoteDisposable = vscode.commands.registerCommand(commands.openNote, (noteLocation: string) => {
    NoteRepository.openNote(noteLocation);
  });
  context.subscriptions.push(openNoteDisposable);

  const refreshNoteFoldersDisposable = vscode.commands.registerCommand(commands.refreshNoteFolders, () => {
    NoteRepository.refreshNoteFolders(notesTree);
  });
  context.subscriptions.push(refreshNoteFoldersDisposable);

  const renameNoteDisposable = vscode.commands.registerCommand(commands.renameNote, (note: Note) => {
    NoteRepository.renameNote(note, notesTree);
  });
  context.subscriptions.push(renameNoteDisposable);

  const unlinkNoteFolder = vscode.commands.registerCommand(commands.unlinkNoteFolder, (noteFolder: NoteFolder) => {
    NoteFolderRepository.unlinkNoteFolder(noteFolder, notesTree);
  });
  context.subscriptions.push(unlinkNoteFolder);

  const openNoteFolder = vscode.commands.registerCommand(commands.openNoteFolder, (noteFolder: NoteFolder) => {
    NoteFolderRepository.openNoteFolder(noteFolder);
  });
  context.subscriptions.push(openNoteFolder);

  const linkNoteFolder = vscode.commands.registerCommand(commands.linkNoteFolder, () => {
    NoteFolderRepository.linkNoteFolder(notesTree);
  });
  context.subscriptions.push(linkNoteFolder);
}

export function activate(context: vscode.ExtensionContext) {
  const { extensionId, extensionShortName } = config;

  logger.info(`"${extensionId}" is now active`);

  const noteFolderLocations = getNoteFolderLocations();

  const notesTree = new NoteFolderProvider(noteFolderLocations);
  vscode.window.registerTreeDataProvider(extensionShortName, notesTree.init());

  registerAllCommands(context, notesTree);
}

// this method is called when your extension is deactivated
export function deactivate() {
  return;
}
