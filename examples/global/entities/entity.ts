import { ClassDeclaration, InterfaceDeclaration } from "../utils/ast-converter";

export class Entity {
  name: string = "Entity";
  ast: ClassDeclaration | InterfaceDeclaration = {
    kind: "ClassDeclaration",
    name: "Entity",
    modifiers: ["export"],
    members: [],
  };
}
