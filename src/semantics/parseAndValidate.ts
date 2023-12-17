import { Model } from "../language/generated/ast.js";
import { MyRoboMLVisitor } from "./interpreter.js";

export function getJsonList(model: Model): any[] {
    
    // Call visitModel and add the JSON to the list
    const rob = new MyRoboMLVisitor();
    const commandes= rob.visitModelimpl(model);
    
    return commandes;
}
