import {  type Model } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { RobotLanguageLanguageMetaData } from '../language/generated/module.js';
import { createRobotLanguageServices } from '../language/robot-language-module.js';
import { extractAstNode, extractDocument } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';
import { MyRoboMLVisitor } from '../semantics/interpreter.js';
export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createRobotLanguageServices(NodeFileSystem).RobotLanguage;
    const model = await extractAstNode<Model>(fileName, services);
    const rob = new MyRoboMLVisitor();
    rob.visitModelimpl(model);
};
export const parseAndValidate = async (fileName: string): Promise<void> => {
    // retrieve the services for our language
    const services = createRobotLanguageServices(NodeFileSystem).RobotLanguage;
    // extract a document for our program
    const document = await extractDocument(fileName, services);
    // extract the parse result details
    const parseResult = document.parseResult;
    // verify no lexer, parser, or general diagnostic errors show up
    if (parseResult.lexerErrors.length === 0 && 
        parseResult.parserErrors.length === 0
    ) {
        process.stdout.write(chalk.green(`[DEBUG] Parsed and validated ${fileName} successfully! \n`));
    } else {
        process.stdout.write(chalk.red(`[DEBUG] Failed to parse and validate ${fileName}! \n`));
    }
};
export type GenerateOptions = {
    destination?: string;
}
export default function(): void {
    const program = new Command();
    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version("0.0.1");
    const fileExtensions = RobotLanguageLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        .action(generateAction);
    program
        .command('parseAndValidate')
        .argument('<file>', 'Source file to parse & validate (ending in ${fileExtensions})')
        .description('Indicates where a program parses & validates successfully, but produces no output code')
        .action(parseAndValidate) 
    program.parse(process.argv);
}