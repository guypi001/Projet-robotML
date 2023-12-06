import { NodeFileSystem } from 'langium/node';
import { createRobotLanguageServices } from '../language/robot-language-module.js';
import { extractAstNode } from '../cli/cli-util.js';
import { Model } from '../language/generated/ast.js';

// declarer une fonction qui prend en parametre un string et qui retourne un objet de type ASTnode
export function parseAndValidate(text: string) {
    let filename = 'temp.robot';
    const fs = require('fs');
    fs.writeFileSync(filename, text);
}
export function generate(text: string) {
    parseAndValidate(text);
    const services = createRobotLanguageServices(NodeFileSystem).RobotLanguage;
    const model = extractAstNode<Model>('temp.robot', services);
    return model;
    
}