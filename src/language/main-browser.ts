import { DocumentState, EmptyFileSystem, startLanguageServer } from 'langium';
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser.js';
import { createRobotLanguageServices } from './robot-language-module.js';

import { Model } from './generated/ast.js';

declare const self: DedicatedWorkerGlobalScope;

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

const { shared } = createRobotLanguageServices({ connection, ...EmptyFileSystem });


startLanguageServer(shared);

shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, documents => {
    for (const document of documents) {
    const moduleAST = document.parseResult
    const module = moduleAST.value as Model; 
        
        connection.sendNotification('browser/DocumentChange', { // Fix: Pass the method name as a string
            uri: document.uri,
            content: module,
            module: document.parseResult
        });
    }
});