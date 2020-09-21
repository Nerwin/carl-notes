import * as vscode from 'vscode';

import { NotesProvider } from './providers/notes.provider';
import { Notes } from './models/notes';
import { Note } from './models/note';
import logger from './logger';
import { config } from './configuration';

function registerAllCommands(context: vscode.ExtensionContext, notesTree: NotesProvider) {
  // delete note
  const deleteNoteDisposable = vscode.commands.registerCommand('cnotes.deleteNote', (note: Note) => {
    Notes.deleteNote(note, notesTree);
  });
  context.subscriptions.push(deleteNoteDisposable);

  // list notes
  const listNotesDisposable = vscode.commands.registerCommand('cnotes.listNotes', () => {
    Notes.listNotes();
  });
  context.subscriptions.push(listNotesDisposable);

  // new note
  const newNoteDisposable = vscode.commands.registerCommand('cnotes.newNote', () => {
    Notes.newNote(notesTree);
  });
  context.subscriptions.push(newNoteDisposable);

  // open note
  const openNoteDisposable = vscode.commands.registerCommand('cnotes.openNote', (note: Note) => {
    Notes.openNote(note);
  });
  context.subscriptions.push(openNoteDisposable);

  // refresh notes
  const refreshNotesDisposable = vscode.commands.registerCommand('cnotes.refreshNotes', () => {
    Notes.refreshNotes(notesTree);
  });
  context.subscriptions.push(refreshNotesDisposable);

  // rename note
  const renameNoteDisposable = vscode.commands.registerCommand('cnotes.renameNote', (note: Note) => {
    Notes.renameNote(note, notesTree);
  });
  context.subscriptions.push(renameNoteDisposable);

  // setup notes
  const setupNotesDisposable = vscode.commands.registerCommand('cnotes.setupNotes', () => {
    Notes.setupNotes();
  });
  context.subscriptions.push(setupNotesDisposable);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const { extensionId, extensionName } = config;

  logger.info(`"${extensionId}" is now active`);

  // register tree view provider
  const notesLocations = Notes.getNotesLocations();

  const notesTree = new NotesProvider(notesLocations);
  vscode.window.registerTreeDataProvider('notes', notesTree.init());

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
          Notes.setupNotes();
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
