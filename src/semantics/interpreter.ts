import { Assignment, BasicType, BinExpr, BooleanLiteral, Deplacement, ForLoop, Funct, FunctionCallStatement, FunctionParameter, GetDistance, GetTime, IfStatement, Model, NumberLiteral, Rotation, Setting, UserDefinedType, VariableDeclaration, VariableReference, WhileLoop, isAssignment, isBinExpr, isBooleanLiteral, isDeplacement, isExpression, isFunctionCallStatement, isGetDistance, isGetTime, isIfStatement, isInternalFunctionCall, isInternalFunctionCallStatement, isNumberLiteral, isRotation, isSetting, isVariableDeclaration, isVariableReference, isWhileLoop } from '../language/generated/ast.js';
import {   RoboMLVisitor } from '../language/visitor.js';
import { Expression } from '../language/generated/ast.js';
import chalk from 'chalk';

export class MyRoboMLVisitor implements RoboMLVisitor {
    visitFunctImpl(node: Funct) {
        // Visit function parameters
        for (const param of node.parameters) {
            //param.accept(this);
            console.log(chalk.green(`[DEBUG] Function parameter: ${param.name} of type ${param.type}`));
            this.visitVariableDeclarationImpl(param);
        }

        // Visit function statements

        for (const stmt of node.body) {

            if (isAssignment(stmt)) {
                this.visitAssignmentImpl(stmt);
                console.log(chalk.green(`[DEBUG] Assigment: ${stmt.variable.ref?.name} of type ${stmt.variable.ref?.type} et valeur ${stmt.variable.ref?.initialValue}`));
            }
            if (isFunctionCallStatement(stmt)) {
                this.visitFunctionCallStatementImpl(stmt);
            }
            if (isVariableDeclaration(stmt)) {
                this.visitVariableDeclarationImpl(stmt);
                console.log(chalk.green(`[DEBUG] Variable declaration: ${stmt.name} of type ${stmt.type} et valeur ${stmt.initialValue}`));
            }
            if(isIfStatement(stmt)) {
                this.visitIfStatementImpl(stmt);
            }
            if(isWhileLoop(stmt)) {
                this.visitWhileLoopImpl(stmt);
            }
            if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt)) {
                if (isGetDistance(stmt)) {
                    this.visitGetDistanceImpl(stmt);
                }
                if (isGetTime(stmt)) {
                    this.visitGetTimeImpl(stmt);
                }
                if (isDeplacement(stmt)) {
                    this.VisitDeplacementImpl(stmt);
                }
                if (isRotation(stmt)) {
                    this.visitRotationImpl(stmt);
                }
                if (isSetting(stmt)) {
                    this.visitSettingImpl(stmt);
                }
            }
        }

        // Visit return value expression (if applicable)
        if (node.returnValue) {
            //node.returnValue.accept(this);
            return this.visitExpressionImpl(node.returnValue);
        }

        return null;
    }
    visitFunctionParameterImpl(node: FunctionParameter) {
        //node.expression.accept(this);
        if (isExpression(node.expression)) {
            return this.visitExpressionImpl(node.expression);
        }
        if (isVariableDeclaration(node.expression)) {
            return this.visitVariableDeclarationImpl(node.expression);
        }
        return null;
    }
    visitFunctionCallStatementImpl(node: FunctionCallStatement) {
        // Visit the function parameters
        for (const param of node.parameters) {
            this.visitFunctionParameterImpl(param);
        }
        // Visit the function reference if it exists
        if (node.function.ref) {
            this.visitFunctImpl(node.function.ref);
        }
        

        return null;
    }
    visitVariableDeclarationImpl(node: VariableDeclaration) {
        let value: any = null;
        if (node.initialValue) {
            if (isExpression(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitExpressionImpl(node.initialValue);
            }
            if (isFunctionCallStatement(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitFunctionCallStatementImpl(node.initialValue);
            }
            if (isInternalFunctionCallStatement(node.initialValue) && isInternalFunctionCall(node.initialValue) && isGetDistance(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitGetDistanceImpl(node.initialValue);
            }
            if (isInternalFunctionCallStatement(node.initialValue) && isInternalFunctionCall(node.initialValue) && isGetTime(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitGetTimeImpl(node.initialValue);
            }
        }
        node.initialValue = value;

        return value;
    }
    visitAssignmentImpl(node: Assignment) {
        // Retrieve the variable declaration referenced by the `variable` property
        let expressionValue: any = null;
        if(node.variable.ref) {
        if(isVariableDeclaration(node.variable.ref) ){
            if(isExpression(node.expression)) {
                // Evaluate the expression value
                expressionValue = this.visitExpressionImpl(node.expression);
            }
            if(isFunctionCallStatement(node.expression)) {
                // Evaluate the expression value
                //const expressionValue = this.visitFunctionCallStatementImpl(node.expression);
            }
            if (isInternalFunctionCallStatement(node.expression) && isInternalFunctionCall(node.expression) && isGetDistance(node.expression)) {
                // Evaluate the expression value
                expressionValue = this.visitGetDistanceImpl(node.expression);
            }
            if (isInternalFunctionCallStatement(node.expression) && isInternalFunctionCall(node.expression) && isGetTime(node.expression)) {
                // Evaluate the expression value
                expressionValue = this.visitGetTimeImpl(node.expression);
            }
        }
        
        // Update the variable declaration's initial value avec une valeur literale, faire un cast
        node.variable.ref.initialValue = expressionValue;

        }
        return expressionValue;
    }

    visitDeplacementImpl(node: Deplacement) {
        if(isExpression(node.distance)){
            if(node.function === 'Forward') {
                // Visit the distance expression
                console.log(chalk.green(`[DEBUG] Variable declaration: ${node.function} de ${this.visitExpressionImpl(node.distance)} cm`));
            }
            if(node.function === 'Backward') {
                // Visit the distance expression
                console.log(chalk.green(`[DEBUG] Variable declaration: ${node.function} de ${this.visitExpressionImpl(node.distance)} cm`));
            }
        }
    }
    visitIfStatementImpl(node: IfStatement) {
        if(isExpression(node.condition)){
        if(this.visitExpressionImpl(node.condition)) {
            // Visit the statements in the 'if' block
            for (const stmt of node.ifbody) {
                if (isAssignment(stmt)) {
                    
                    this.visitAssignmentImpl(stmt);
                }
                if (isFunctionCallStatement(stmt)) {
                    this.visitFunctionCallStatementImpl(stmt);  
                }
                if (isVariableDeclaration(stmt)) {
                    
                    this.visitVariableDeclarationImpl(stmt);
                }
                if(isIfStatement(stmt)) {
                    this.visitIfStatementImpl(stmt);
                }
                if(isWhileLoop(stmt)) {
                    this.visitWhileLoopImpl(stmt);
                }
            }
        }else {
            // Visit the statements in the 'else' block (if present)
            if (node.elsebody.length > 0) {
                for (const stmt of node.elsebody) {
                    if (isAssignment(stmt)) {
                        this.visitAssignmentImpl(stmt);
                    }
                    if (isFunctionCallStatement(stmt)) {
                        this.visitFunctionCallStatementImpl(stmt);
                    }
                    if (isVariableDeclaration(stmt)) {
                        this.visitVariableDeclarationImpl(stmt);
                    }
                    if(isIfStatement(stmt)) {
                        this.visitIfStatementImpl(stmt);
                    }
                    if(isWhileLoop(stmt)) {
                        this.visitWhileLoopImpl(stmt);
                    }
                }
            }
        }
    }

        return null;
    }
    visitWhileLoopImpl(node: WhileLoop) {
        if(isExpression(node.condition)){
        while (this.visitExpressionImpl(node.condition)) {
            // Visit the statements in the loop body
            for (const stmt of node.body) {
                if (isAssignment(stmt)) {
                    this.visitAssignmentImpl(stmt);
                }
                if (isFunctionCallStatement(stmt)) {
                    this.visitFunctionCallStatementImpl(stmt);
                }
                if (isVariableDeclaration(stmt)) {
                    this.visitVariableDeclarationImpl(stmt);
                }
                if(isIfStatement(stmt)) {
                    this.visitIfStatementImpl(stmt);
                }
                if(isWhileLoop(stmt)) {
                    this.visitWhileLoopImpl(stmt);
                }
                if(isDeplacement(stmt)) {
                    this.visitDeplacementImpl(stmt);
                }
                if(isRotation(stmt)) {
                    this.visitRotationImpl(stmt);
                }
                if(isSetting(stmt)) {
                    this.visitSettingImpl(stmt);
                }
                if(isGetDistance(stmt)) {
                    this.visitGetDistanceImpl(stmt);
                }
            }
        }
    }

        return null;
    }
    visitForLoopImpl(node: ForLoop) {
        throw new Error('Method not implemented.');
    }
    visitRotationImpl(node: Rotation) {
        // Visit the angle expression
        if (isExpression(node.angle)) {
            console.log(chalk.green(`[DEBUG]  ${node.function} de ${this.visitExpressionImpl(node.angle)} deg`));
        }

  return null;
    }
    visitExpressionImpl(node: Expression): any {
        // Handle the `ge` expression (if present)
        if (node.ge) {
            return this.visitExpressionImpl(node.ge);
        }

        // Handle the `ne` expression (if present)
        if (node.ne) {
            return -1 * this.visitExpressionImpl(node.ne);
        }

        if (isBinExpr(node)) {
            return this.visitBinExprImpl(node);
        }
        if (isBooleanLiteral(node)) {
            return this.visitBooleanLiteralImpl(node);
        }
        if (isNumberLiteral(node)) {
            return this.visitNumberLiteralImpl(node);
        }
        if(isVariableReference(node)) {
            console.log("ooo")
            return this.visitVariableReferenceImpl(node);
        }

        return 'bim';
    }
    visitGetDistanceImpl(node: GetDistance): any {
        return 60;
    }
    VisitDeplacementImpl(node: Deplacement) {
        // Visit the distance expression
        if(isExpression(node.distance)){
            if(node.function === 'Forward') {
                // Visit the distance expression
                console.log(chalk.green(`[DEBUG]  ${node.function} de ${this.visitExpressionImpl(node.distance)} cm`));
            }
            if(node.function === 'Backward') {
                // Visit the distance expression
                console.log(chalk.green(`[DEBUG]  ${node.function} de ${this.visitExpressionImpl(node.distance)} cm`));
            }
        }

        return null;
    }
    visitSettingImpl(node: Setting) {
        if(isExpression(node.vitesse)){
            console.log(chalk.green(`[DEBUG] Setting vitesse:  = ${this.visitExpressionImpl(node.vitesse)}`));
        }
    }
    visitGetTimeImpl(node: GetTime): any {
        return 5;
    }
    visitBasicTypeImpl(node: BasicType) {
        throw new Error('Method not implemented.');
    }
    visitUserDefinedTypeImpl(node: UserDefinedType) {
        throw new Error('Method not implemented.');
    }
    visitBinExprImpl(node: BinExpr) {
        let left: any = node.e1;
        let right: any = node.e2;

        if (isBinExpr(left)) {
            left = this.visitBinExprImpl(left);
        }
        if (isBinExpr(right)) {
            right = this.visitBinExprImpl(right);
        }
        if(isNumberLiteral(left)) {
            left = this.visitNumberLiteralImpl(left);
        }
        if(isNumberLiteral(right)) {
            right = this.visitNumberLiteralImpl(right);
        }
        if(isVariableReference(left)) {
            left = this.visitVariableReferenceImpl(left);
        }
        if(isVariableReference(right)) {
            right = this.visitVariableReferenceImpl(right);
        }
        if(isBooleanLiteral(left)) {
            left = this.visitBooleanLiteralImpl(left);
        }
        if(isBooleanLiteral(right)) {
            right = this.visitBooleanLiteralImpl(right);
        }

        // Handle the binary operator (op) based on its type
        switch (node.op) {
            case '!=':
            // Handle the '!=' operator
                return left !== right;
            case '&&':
            // Handle the '&&' operator
                return left && right;
            case '*':
                // Handle the '*' operator
                return Number(left) * Number(right);
            case '+':
            // Handle the '+' operator
                return Number(left) + Number(right);
            case '-':
            // Handle the '-' operator
                return Number(left) - Number(right);
            case '/':
            // Handle the '/' operator
                return Number(left) / Number(right);
            case '<':
            // Handle the '<' operator
                return left < right;
            case '<=':
            // Handle the '<=' operator
                return left <= right;
            case '==':
            // Handle the '==' operator
                return left === right;
            case '>':
            // Handle the '>' operator
                return left > right;
            case '>=':
            // Handle the '>=' operator
                return left >= right;
            case '||':
            // Handle the '||' operator
                return left || right;
            default:
            // Handle any other unsupported binary operators
        }

        return null;
    }
    visitBooleanLiteralImpl(node: BooleanLiteral) {
          return node.value;
    }
    visitNumberLiteralImpl(node: NumberLiteral) {
        return node.value;
    }
    visitVariableReferenceImpl(node: VariableReference): any {
        if(node.variable.ref) {
            if(isVariableDeclaration(node.variable.ref)) {
                if(node.variable.ref.initialValue) {
                    if(isNumberLiteral(node.variable.ref.initialValue)) {
                        return this.visitNumberLiteralImpl(node.variable.ref.initialValue);
                    }
                }
            }
        }
        return 'y';
    }
    public visitModelimpl(node: Model): any {
    console.log(chalk.green(`[DEBUG] Model: `));
        node.functions.forEach(funct => {
            if(funct.name === 'entry') {
                console.log(chalk.green(`[DEBUG] Function: ${funct.name}`));
                this.visitFunctImpl(funct as Funct);
            }
        })
        return null;
    }
}