import { AstNode, EmptyFileSystem, LangiumSharedServices, URI, startLanguageServer } from 'langium';
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser.js';
import { createRobotLanguageServices } from './robot-language-module.js';
import { MyRoboMLVisitor } from '../semantics/interpreter.js';
import { Model } from './generated/ast.js';



async function extractAstNodeFromString<T extends AstNode>(content: string,uri: string, services: LangiumSharedServices): Promise<T> {
    // create a document from a string instead of a file
    const doc = services.workspace.LangiumDocumentFactory.fromString(content, URI.parse(uri));
    
    // get the parse result (root of our AST)
    return doc.parseResult?.value as T;
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
    const rob = new MyRoboMLVisitor();
    let command = rob.visitModelimpl(model);
    console.log('execute2', command);
    connection.sendNotification('backend/execute',{type:"rotate",value:30})
});
