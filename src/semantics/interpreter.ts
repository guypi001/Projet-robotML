import { BinExpr, BooleanLiteral, NumberLiteral, isAssignment, isBinExpr, isBooleanLiteral, isDeplacement, isExpression, isFunctionCallStatement, isGetDistance, isGetTime, isIfStatement, isInternalFunctionCall, isInternalFunctionCallStatement, isNumberLiteral, isVariableDeclaration, isVariableReference, isWhileLoop } from '../language/generated/ast.js';
import { AssignmentImpl, BasicTypeImpl, BinExprImpl, BooleanLiteralImpl, DeplacementImpl, ExpressionImpl, ForLoopImpl, FunctImpl, FunctionCallStatementImpl, FunctionParameterImpl, GetDistanceImpl, GetTimeImpl, IfStatementImpl, Modelimpl, NumberLiteralImpl, RoboMLVisitor, RotationImpl, SettingImpl, UserDefinedTypeImpl, VariableDeclarationImpl, VariableReferenceImpl, WhileLoopImpl } from '../language/visitor.js';
import { Expression } from '../language/generated/ast.js';

export class MyRoboMLVisitor implements RoboMLVisitor {
    visitFunctImpl(node: FunctImpl) {
        // Visit function parameters
        for (const param of node.parameters) {
            //param.accept(this);
            this.visitVariableDeclarationImpl(param as VariableDeclarationImpl);
        }

        // Visit function statements

        for (const stmt of node.body) {

            if (isAssignment(stmt)) {
                const assignment = new AssignmentImpl(node, stmt.variable, stmt.expression as Expression);
                //assignment.accept(this);
                this.visitAssignmentImpl(assignment);
            }
            if (isFunctionCallStatement(stmt)) {
                const functionCallStatement = new FunctionCallStatementImpl(node, stmt.function, stmt.parameters.map(param => new FunctionParameterImpl(stmt, param.$type, param.expression as ExpressionImpl)));
                //functionCallStatement.accept(this);
                this.visitFunctionCallStatementImpl(functionCallStatement);
            }
            if (isVariableDeclaration(stmt)) {
                const variableDeclaration = new VariableDeclarationImpl(node, stmt.name, stmt.type, stmt.initialValue as ExpressionImpl);
                //variableDeclaration.accept(this);
                this.visitVariableDeclarationImpl(variableDeclaration);
            }
            if(isIfStatement(stmt)) {
                const ifStatement = new IfStatementImpl(stmt, stmt.condition, stmt.ifbody, stmt.elsebody);
                //ifStatement.accept(this);
                this.visitIfStatementImpl(ifStatement);
            }
            if(isWhileLoop(stmt)) {
                const whileLoop = new WhileLoopImpl(stmt, stmt.condition, stmt.body);
                //whileLoop.accept(this);
                this.visitWhileLoopImpl(whileLoop);
            }
            if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt)) {
                if (isGetDistance(stmt)) {
                    const getDistance = new GetDistanceImpl(node);
                    //getDistance.accept(this);
                    this.visitGetDistanceImpl(getDistance);
                }
                if (isGetTime(stmt)) {
                    const getTime = new GetTimeImpl(node);
                    //getTime.accept(this);
                    this.visitGetTimeImpl(getTime);
                }
                if (isDeplacement(stmt)) {
                    if(stmt.function === 'Forward') {
                        const deplacement = new DeplacementImpl(node, stmt.distance, 'Forward');
                        //deplacement.accept(this);
                        this.visitDeplacementImpl(deplacement);
                    }
                    if(stmt.function === 'Backward') {
                        const deplacement = new DeplacementImpl(node, stmt.distance, 'Backward');
                        //deplacement.accept(this);
                        this.visitDeplacementImpl(deplacement);
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
    visitFunctionParameterImpl(node: FunctionParameterImpl) {
        //node.expression.accept(this);
        if (isExpression(node.expression)) {
            return this.visitExpressionImpl(node.expression as ExpressionImpl);
        }
        if (isVariableDeclaration(node.expression)) {
            return this.visitVariableDeclarationImpl(node.expression as VariableDeclarationImpl);
        }
        return null;
    }
    visitFunctionCallStatementImpl(node: FunctionCallStatementImpl) {
        // Visit the function parameters
        for (const param of node.parameters) {
            this.visitFunctionParameterImpl(param);
        }
        // Visit the function reference if it exists
        if (node.function.ref) {
            this.visitFunctImpl(node.function.ref as FunctImpl);
        }
        

        return null;
    }
    visitVariableDeclarationImpl(node: VariableDeclarationImpl) {
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
                value = this.visitGetDistanceImpl(node.initialValue as GetDistanceImpl);
            }
            if (isInternalFunctionCallStatement(node.initialValue) && isInternalFunctionCall(node.initialValue) && isGetTime(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitGetTimeImpl(node.initialValue as GetTimeImpl);
            }

        }
        node.initialValue = value;

        return value;
    }
    visitAssignmentImpl(node: AssignmentImpl) {
        // Retrieve the variable declaration referenced by the `variable` property
        const variableDeclaration = node.variable.ref as VariableDeclarationImpl;

        // Evaluate the expression value
        const expressionValue = this.visitExpressionImpl(node.expression as ExpressionImpl);

        // Assign the evaluated expression value to the variable
        variableDeclaration.initialValue = expressionValue;

        return variableDeclaration;
    }

    visitDeplacementImpl(node: DeplacementImpl) {
        throw new Error('Method not implemented.');
    }
    visitIfStatementImpl(node: IfStatementImpl) {
        if(this.visitExpressionImpl(node.condition as ExpressionImpl)) {
            // Visit the statements in the 'if' block
            for (const stmt of node.ifbody) {
                if (isAssignment(stmt)) {
                    const assignment = new AssignmentImpl(node, stmt.variable, stmt.expression as Expression);
                    //assignment.accept(this);
                    this.visitAssignmentImpl(assignment);
                }
                if (isFunctionCallStatement(stmt)) {
                    this.visitFunctionCallStatementImpl(stmt as FunctionCallStatementImpl);  
                }
                if (isVariableDeclaration(stmt)) {
                    const variableDeclaration = new VariableDeclarationImpl(node, stmt.name, stmt.type, stmt.initialValue as ExpressionImpl);
                    //variableDeclaration.accept(this);
                    this.visitVariableDeclarationImpl(variableDeclaration);
                }
                if(isIfStatement(stmt)) {
                    const ifStatement = new IfStatementImpl(node, stmt.condition, stmt.ifbody, stmt.elsebody);
                    //ifStatement.accept(this);
                    this.visitIfStatementImpl(ifStatement);
                }
                if(isWhileLoop(stmt)) {
                    const whileLoop = new WhileLoopImpl(node, stmt.condition, stmt.body);
                    //whileLoop.accept(this);
                    this.visitWhileLoopImpl(whileLoop);
                }
            }
        }else {
            // Visit the statements in the 'else' block (if present)
            if (node.elsebody.length > 0) {
                for (const stmt of node.elsebody) {
                    if (isAssignment(stmt)) {
                        const assignment = new AssignmentImpl(node, stmt.variable, stmt.expression as Expression);
                        //assignment.accept(this);
                        this.visitAssignmentImpl(assignment);
                    }
                    if (isFunctionCallStatement(stmt)) {
                        this.visitFunctionCallStatementImpl(stmt as FunctionCallStatementImpl);
                    }
                    if (isVariableDeclaration(stmt)) {
                        const variableDeclaration = new VariableDeclarationImpl(node, stmt.name, stmt.type, stmt.initialValue as ExpressionImpl);
                        //variableDeclaration.accept(this);
                        this.visitVariableDeclarationImpl(variableDeclaration);
                    }
                    if(isIfStatement(stmt)) {
                        const ifStatement = new IfStatementImpl(node, stmt.condition, stmt.ifbody, stmt.elsebody);
                        //ifStatement.accept(this);
                        this.visitIfStatementImpl(ifStatement);
                    }
                    if(isWhileLoop(stmt)) {
                        const whileLoop = new WhileLoopImpl(node, stmt.condition, stmt.body);
                        //whileLoop.accept(this);
                        this.visitWhileLoopImpl(whileLoop);
                    }
                }
            }
        }

        return null;
    }
    visitWhileLoopImpl(node: WhileLoopImpl) {
        while (this.visitExpressionImpl(node.condition as ExpressionImpl)) {
            // Visit the statements in the loop body
            for (const stmt of node.body) {
                if (isAssignment(stmt)) {
                    const assignment = new AssignmentImpl(node, stmt.variable, stmt.expression as Expression);
                    //assignment.accept(this);
                    this.visitAssignmentImpl(assignment);
                }
                if (isFunctionCallStatement(stmt)) {
                    this.visitFunctionCallStatementImpl(stmt as FunctionCallStatementImpl);
                }
                if (isVariableDeclaration(stmt)) {
                    const variableDeclaration = new VariableDeclarationImpl(node, stmt.name, stmt.type, stmt.initialValue as ExpressionImpl);
                    //variableDeclaration.accept(this);
                    this.visitVariableDeclarationImpl(variableDeclaration);
                }
                if(isIfStatement(stmt)) {
                    const ifStatement = new IfStatementImpl(node, stmt.condition, stmt.ifbody, stmt.elsebody);
                    //ifStatement.accept(this);
                    this.visitIfStatementImpl(ifStatement);
                }
                if(isWhileLoop(stmt)) {
                    const whileLoop = new WhileLoopImpl(node, stmt.condition, stmt.body);
                    //whileLoop.accept(this);
                    this.visitWhileLoopImpl(whileLoop);
                }
            }
        }

        return null;
    }
    visitForLoopImpl(node: ForLoopImpl) {
        throw new Error('Method not implemented.');
    }
    visitRotationImpl(node: RotationImpl) {
        // Visit the angle expression
        if (isExpression(node.angle)) {
            this.visitExpressionImpl(node.angle as ExpressionImpl);
        }

  return null;
    }
    visitExpressionImpl(node: Expression): any {
        // Handle the `ge` expression (if present)
        if (node.ge) {
            return this.visitExpressionImpl(node.ge as ExpressionImpl);
        }

        // Handle the `ne` expression (if present)
        if (node.ne) {
            return -1 * this.visitExpressionImpl(node.ne as ExpressionImpl);
        }

        if (isBinExpr(node)) {
            return this.visitBinExprImpl(node as BinExprImpl);
        }

        return 'bim';
    }
    visitGetDistanceImpl(node: GetDistanceImpl) {
        throw new Error('Method not implemented.');
    }
    DeplacementImpl(node: DeplacementImpl) {
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
    visitSettingImpl(node: SettingImpl) {
        // Handle the unit property
        if (node.unit) {
            // Perform type checking or unit conversion for the unit value
        }

        // Visit the vitesse expression
        this.visitExpressionImpl(node.vitesse as ExpressionImpl);

        return null;
    }
    visitGetTimeImpl(node: GetTimeImpl) {
        throw new Error('Method not implemented.');
    }
    visitBasicTypeImpl(node: BasicTypeImpl) {
        throw new Error('Method not implemented.');
    }
    visitUserDefinedTypeImpl(node: UserDefinedTypeImpl) {
        throw new Error('Method not implemented.');
    }
visitBinExprImpl(node: BinExpr) {
        let left: any = node.e1;
        let right: any = node.e2;

        if (isBinExpr(left)) {
            const binExprImpl: BinExprImpl = new BinExprImpl(left.e1, left.e2, left.op);
            left = this.visitBinExprImpl(binExprImpl);
        }
        if (isBinExpr(right)) {
            const binExprImpl: BinExprImpl = new BinExprImpl(right.e1, right.e2, right.op);
            right = this.visitBinExprImpl(binExprImpl);
        }
        if(isNumberLiteral(left)) {
            left = this.visitNumberLiteralImpl(left as NumberLiteralImpl);
        }
        if(isNumberLiteral(right)) {
            right = this.visitNumberLiteralImpl(right as NumberLiteralImpl);
        }
        if(isVariableReference(left)) {
            left = this.visitVariableReferenceImpl(left as VariableReferenceImpl);
        }
        if(isVariableReference(right)) {
            right = this.visitVariableReferenceImpl(right as VariableReferenceImpl);
        }
        if(isBooleanLiteral(left)) {
            left = this.visitBooleanLiteralImpl(left as BooleanLiteralImpl);
        }
        if(isBooleanLiteral(right)) {
            right = this.visitBooleanLiteralImpl(right as BooleanLiteralImpl);
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
    visitVariableReferenceImpl(node: VariableReferenceImpl): any {
        const variableDeclaration = node.variable.ref as VariableDeclarationImpl;
        if (isExpression(variableDeclaration.initialValue)) {
            // Check the variable's type
            if (variableDeclaration.type === 'bool') {
                if (isBooleanLiteral(variableDeclaration.initialValue)) {
                    return this.visitBooleanLiteralImpl(variableDeclaration.initialValue as BooleanLiteralImpl);
                }
            } else if (variableDeclaration.type === 'number') {
                if (isNumberLiteral(variableDeclaration.initialValue)) {
                    return this.visitNumberLiteralImpl(variableDeclaration.initialValue as NumberLiteralImpl);
                }
            }
        }
        if (isFunctionCallStatement(variableDeclaration.initialValue)) {
            return this.visitFunctionCallStatementImpl(variableDeclaration.initialValue as FunctionCallStatementImpl);
        }
        if (isInternalFunctionCallStatement(variableDeclaration.initialValue) && isInternalFunctionCall(variableDeclaration.initialValue) && isGetDistance(variableDeclaration.initialValue)) {
            return this.visitGetDistanceImpl(variableDeclaration.initialValue as GetDistanceImpl);
        }
        if (isInternalFunctionCallStatement(variableDeclaration.initialValue) && isInternalFunctionCall(variableDeclaration.initialValue) && isGetTime(variableDeclaration.initialValue)) {
            return this.visitGetTimeImpl(variableDeclaration.initialValue as GetTimeImpl);
        }
        if (isVariableReference(variableDeclaration.initialValue)) {
            return this.visitVariableReferenceImpl(variableDeclaration.initialValue as VariableReferenceImpl);
        }
        return null;
    }
    public visitModelimpl(node: Modelimpl): any {
        node.functions.forEach(funct => {
            if(funct.name === 'entry') {
                this.visitFunctImpl(funct as FunctImpl);
            }
        })
        return null;
    }
}