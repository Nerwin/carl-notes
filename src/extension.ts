import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';

import { NotesProvider } from './providers/notes.provider';
import { NoteRepository } from './repositories/note.repository';
import { Note } from './models/note';
import logger from './logger';
import { config } from './configuration';
import commands from './configuration/commands';
import { NoteFolderRepository } from './repositories/noteFolder.repository';
import { NoteFolder } from './models/noteFolder';

function registerAllCommands(context: vscode.ExtensionContext, notesTree: NotesProvider) {
  const deleteNoteDisposable = vscode.commands.registerCommand(commands.deleteNote, (note: Note) => {
    NoteRepository.deleteNote(note, notesTree);
  });
  context.subscriptions.push(deleteNoteDisposable);

  const listNotesDisposable = vscode.commands.registerCommand(commands.listNotes, () => {
    NoteRepository.listNotes();
  });
  context.subscriptions.push(listNotesDisposable);

  const newNoteDisposable = vscode.commands.registerCommand(commands.newNote, () => {
    NoteRepository.newNote(notesTree);
  });
  context.subscriptions.push(newNoteDisposable);

  const openNoteDisposable = vscode.commands.registerCommand(commands.openNote, (note: Note) => {
    NoteRepository.openNote(note);
  });
  context.subscriptions.push(openNoteDisposable);

  const refreshNotesDisposable = vscode.commands.registerCommand(commands.refreshNotes, () => {
    NoteRepository.refreshNotes(notesTree);
  });
  context.subscriptions.push(refreshNotesDisposable);

  const renameNoteDisposable = vscode.commands.registerCommand(commands.renameNote, (note: Note) => {
    NoteRepository.renameNote(note, notesTree);
  });
  context.subscriptions.push(renameNoteDisposable);

  const setupNotesDisposable = vscode.commands.registerCommand(commands.setupNotes, () => {
    NoteRepository.setupNotes();
  });
  context.subscriptions.push(setupNotesDisposable);

  const deleteNoteFolder = vscode.commands.registerCommand(commands.deleteNoteFolder, (noteFolder: NoteFolder) => {
    NoteFolderRepository.deleteNoteFolder(noteFolder, notesTree);
  });
  context.subscriptions.push(deleteNoteFolder);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const { extensionId, extensionName } = config;

  logger.info(`"${extensionId}" is now active`);
  const settingsFile = path.join(context.globalStoragePath, 'NotesLocation.json');
  if (!fs.existsSync(context.globalStoragePath)) fs.mkdirSync(context.globalStoragePath);

  if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify({}));
  }
  const settings = JSON.parse(fs.readFileSync(settingsFile).toString());

  // register tree view provider
  const notesLocations = NoteRepository.getNotesLocations();

  const notesTree = new NotesProvider(notesLocations);
  vscode.window.registerTreeDataProvider('cnotes', notesTree.init());

  // prompt user to select a storage location
  if (!notesLocations || notesLocations?.length < 1) {
    vscode.window
      .showWarningMessage(
        `You need to setup at least one notes storage location before you can start using ${extensionName}`,
        'Select',
        'Cancel',
      )
      .then(result => {
        // if the user answers Select
        if (result === 'Select') {
          NoteRepository.setupNotes();
        }
      });
    return;
  }

  registerAllCommands(context, notesTree);
}

// this method is called when your extension is deactivated
export function deactivate() {
  return;
}
