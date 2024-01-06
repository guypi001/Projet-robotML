import { AstNode, EmptyFileSystem, LangiumSharedServices, URI, startLanguageServer } from 'langium';
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser.js';
import { createRobotLanguageServices } from './robot-language-module.js';
import { Model } from './generated/ast.js';
import { getJsonList } from '../semantics/parseAndValidate.js';
import { Diagnostic } from 'vscode-languageclient';



async function extractAstNodeFromString<T extends AstNode>(content: string,uri: string, services: LangiumSharedServices): Promise<T> {
    // create a document from a string instead of a file
    const doc = services.workspace.LangiumDocumentFactory.fromString(content, URI.parse(uri));
    await shared.workspace.DocumentBuilder.build([doc], );
    // get the parse result (root of our AST)
    return doc.parseResult?.value as T;
}

async function extractParseResultFromString<T extends AstNode>(content: string, uri: string, services: LangiumSharedServices): Promise<Diagnostic[]> {
    // create a document from a string instead of a file
    const doc = services.workspace.LangiumDocumentFactory.fromString(content, URI.parse(uri));
    await shared.workspace.DocumentBuilder.build([doc], { validation: true });
    const validationErrors = (doc.diagnostics ?? []).filter(e => e.severity === 1);
    // get the parse result (root of our AST)
    return validationErrors;
}

declare const self: DedicatedWorkerGlobalScope;

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

const { shared } = createRobotLanguageServices({ connection, ...EmptyFileSystem });


startLanguageServer(shared);

connection.onNotification('browser/execute', async ({ uri, content }) => {
    console.log('execute1', uri, content);
    let ast = await extractAstNodeFromString<Model>(content, uri, shared);
    let model = ast
    console.log('execute1', model);
    const liste = getJsonList(model);
    connection.sendNotification('backend/execute',liste)
});

connection.onNotification('browser/parseAndValidate', async ({ uri, content }) => {
    console.log('execute1', uri, content);
    let diagnostic = await extractParseResultFromString<Model>(content, uri, shared);
    console.log('execute1', diagnostic);
    
    connection.sendNotification('backend/parseAndValidate',diagnostic)
});
