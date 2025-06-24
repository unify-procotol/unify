import { ClassDeclaration, InterfaceDeclaration } from "../utils/ast-converter";

export class Entity {
  ast: ClassDeclaration | InterfaceDeclaration = {
    kind: "ClassDeclaration",
    name: "Entity",
    modifiers: ["export"],
    members: [],
  };
}
