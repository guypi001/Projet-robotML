import { Assignment, BasicType, BinExpr, BooleanLiteral, Deplacement, ForLoop, Funct, FunctionCallStatement, FunctionParameter, GetDistance, GetTime, IfStatement, Model, NumberLiteral, Rotation, Setting, UserDefinedType, VariableDeclaration, VariableReference, WhileLoop, isAssignment, isBinExpr, isBooleanLiteral, isDeplacement, isExpression, isFunctionCallStatement, isGetDistance, isGetTime, isIfStatement, isInternalFunctionCall, isInternalFunctionCallStatement, isNumberLiteral, isVariableDeclaration, isVariableReference, isWhileLoop } from '../language/generated/ast.js';
import {  ExpressionImpl, RoboMLVisitor } from '../language/visitor.js';
import { Expression } from '../language/generated/ast.js';

export class MyRoboMLVisitor implements RoboMLVisitor {
visitFunctImpl(node: Funct) {
        // Visit function parameters
        for (const param of node.parameters) {
            //param.accept(this);
            this.visitVariableDeclarationImpl(param);
        }

        // Visit function statements

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
            if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt)) {
                if (isGetDistance(stmt)) {
                    this.visitGetDistanceImpl(stmt);
                }
                if (isGetTime(stmt)) {
                    this.visitGetTimeImpl(stmt);
                }
                if (isDeplacement(stmt)) {
                    if(stmt.function === 'Forward') {
                        this.visitDeplacementImpl(stmt);
                    }
                    if(stmt.function === 'Backward') {
                        this.visitDeplacementImpl(stmt);
                    }
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
        const variableDeclaration = node.variable.ref;
        if(isVariableDeclaration(variableDeclaration) ){
            if(isExpression(node.expression)) {
                // Evaluate the expression value
                const expressionValue = this.visitExpressionImpl(node.expression);

                // Assign the evaluated expression value to the variable
                variableDeclaration.initialValue = expressionValue;
            }
        }
        return variableDeclaration;
    }

    visitDeplacementImpl(node: Deplacement) {
        throw new Error('Method not implemented.');
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
            this.visitExpressionImpl(node.angle as ExpressionImpl);
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
            return this.visitVariableReferenceImpl(node);
        }

        return 'bim';
    }
    visitGetDistanceImpl(node: GetDistance) {
        throw new Error('Method not implemented.');
    }
    DeplacementImpl(node: Deplacement) {
        // Visit the distance expression
        this.visitExpressionImpl(node.distance as ExpressionImpl);

        // Handle the unit and unit2 properties (if present)
        if (node.unit) {
            // Handle the unit value (e.g., type checking, unit conversion)
        }

        if (node.unit2) {
            // Handle the unit2 value (e.g., type checking, unit conversion)
        }

        return null;
    }
    visitSettingImpl(node: Setting) {
        // Handle the unit property
        if (node.unit) {
            // Perform type checking or unit conversion for the unit value
        }

        // Visit the vitesse expression
        this.visitExpressionImpl(node.vitesse as ExpressionImpl);

        return null;
    }
    visitGetTimeImpl(node: GetTime) {
        throw new Error('Method not implemented.');
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
        const variableDeclaration = node.variable.ref;
        if(isVariableDeclaration(variableDeclaration) ){
            if (isExpression(variableDeclaration.initialValue)) {
                // Check the variable's type
                if (variableDeclaration.type === 'bool') {
                    if (isBooleanLiteral(variableDeclaration.initialValue)) {
                        return this.visitBooleanLiteralImpl(variableDeclaration.initialValue);
                    }
                } else if (variableDeclaration.type === 'number') {
                    if (isNumberLiteral(variableDeclaration.initialValue)) {
                        return this.visitNumberLiteralImpl(variableDeclaration.initialValue);
                    }
                }
                if(isExpression(variableDeclaration.initialValue)) {
                    return this.visitExpressionImpl(variableDeclaration.initialValue as ExpressionImpl);
                }
            }
            if (isFunctionCallStatement(variableDeclaration.initialValue)) {
                return this.visitFunctionCallStatementImpl(variableDeclaration.initialValue);
            }
            if (isInternalFunctionCallStatement(variableDeclaration.initialValue) && isInternalFunctionCall(variableDeclaration.initialValue) && isGetDistance(variableDeclaration.initialValue)) {
                return this.visitGetDistanceImpl(variableDeclaration.initialValue);
            }
            if (isInternalFunctionCallStatement(variableDeclaration.initialValue) && isInternalFunctionCall(variableDeclaration.initialValue) && isGetTime(variableDeclaration.initialValue)) {
                return this.visitGetTimeImpl(variableDeclaration.initialValue);
            }
            if (isVariableReference(variableDeclaration.initialValue)) {
                return this.visitVariableReferenceImpl(variableDeclaration.initialValue);
            }
        }
        return variableDeclaration;
    }
    public visitModelimpl(node: Model): any {
        node.functions.forEach(funct => {
            if(funct.name === 'entry') {
            this.visitFunctImpl(funct as Funct);
            }
        })
        return null;
    }
}