// TypeScript AST 转换工具类

export interface ASTNode {
  kind: string;
  [key: string]: any;
}

export interface PropertySignature extends ASTNode {
  kind: 'PropertySignature';
  name: string;
  type: TypeNode;
  optional: boolean;
  modifiers?: string[];
}

export interface TypeNode extends ASTNode {
  kind: string;
  typeName?: string;
  elementType?: TypeNode;
  types?: TypeNode[];
}

export interface ClassDeclaration extends ASTNode {
  kind: 'ClassDeclaration';
  name: string;
  modifiers: string[];
  members: PropertySignature[];
  heritage?: string[];
}

export interface InterfaceDeclaration extends ASTNode {
  kind: 'InterfaceDeclaration';
  name: string;
  modifiers: string[];
  members: PropertySignature[];
  heritage?: string[];
}

export interface ImportDeclaration extends ASTNode {
  kind: 'ImportDeclaration';
  moduleSpecifier: string;
  importClause?: {
    namedBindings?: {
      elements: { name: string; isTypeOnly: boolean }[];
    };
  };
}

export interface SourceFile extends ASTNode {
  kind: 'SourceFile';
  fileName: string;
  statements: ASTNode[];
}

/**
 * 将类转换为 TypeScript AST 格式
 * @param entityClass 类构造函数
 * @param entityName 实体名称（可选，默认使用类名）
 * @returns TypeScript AST 格式的对象
 */
export function classToAST<T>(
  entityClass: new () => T,
  entityName?: string
): ClassDeclaration {
  const instance = new entityClass();
  const className = entityName || entityClass.name;
  
  const members: PropertySignature[] = [];
  
  // 获取类的所有属性
  const keys = Object.keys(instance as object);
  
  keys.forEach(key => {
    const value = (instance as any)[key];
    const typeInfo = inferTypeFromValue(value, key);
    const isOptional = isOptionalProperty(key, value);
    
    const propertySignature: PropertySignature = {
      kind: 'PropertySignature',
      name: key,
      type: typeInfo,
      optional: isOptional,
      modifiers: []
    };
    
    members.push(propertySignature);
  });
  
  return {
    kind: 'ClassDeclaration',
    name: className,
    modifiers: ['export'],
    members
  };
}

/**
 * 将类转换为接口 AST 格式
 * @param entityClass 类构造函数
 * @param entityName 实体名称（可选，默认使用类名）
 * @returns TypeScript Interface AST 格式的对象
 */
export function classToInterfaceAST<T>(
  entityClass: new () => T,
  entityName?: string
): InterfaceDeclaration {
  const instance = new entityClass();
  const className = entityName || entityClass.name;
  
  const members: PropertySignature[] = [];
  
  // 获取类的所有属性
  const keys = Object.keys(instance as object);
  
  keys.forEach(key => {
    const value = (instance as any)[key];
    const typeInfo = inferTypeFromValue(value, key);
    const isOptional = isOptionalProperty(key, value);
    
    const propertySignature: PropertySignature = {
      kind: 'PropertySignature',
      name: key,
      type: typeInfo,
      optional: isOptional
    };
    
    members.push(propertySignature);
  });
  
  return {
    kind: 'InterfaceDeclaration',
    name: className,
    modifiers: ['export'],
    members
  };
}

/**
 * 从值推断 TypeScript 类型节点
 */
function inferTypeFromValue(value: any, propertyName: string): TypeNode {
  if (Array.isArray(value)) {
    const elementType = value.length > 0 
      ? inferTypeFromValue(value[0], propertyName)
      : { kind: 'AnyKeyword', typeName: 'any' };
    
    return {
      kind: 'ArrayType',
      elementType
    };
  }
  
  const baseType = typeof value;
  
  switch (baseType) {
    case 'string':
      return { kind: 'StringKeyword', typeName: 'string' };
    case 'number':
      return { kind: 'NumberKeyword', typeName: 'number' };
    case 'boolean':
      return { kind: 'BooleanKeyword', typeName: 'boolean' };
    case 'object':
      if (value === null) {
        return { kind: 'NullKeyword', typeName: 'null' };
      }
      
      // 检查是否是自定义实体类型
      if (propertyName.toLowerCase().includes('user')) {
        return { kind: 'TypeReference', typeName: 'UserEntity' };
      }
      if (propertyName.toLowerCase().includes('post')) {
        return { kind: 'TypeReference', typeName: 'PostEntity' };
      }
      
      return { kind: 'TypeLiteral', typeName: 'object' };
    case 'undefined':
      return { kind: 'UndefinedKeyword', typeName: 'undefined' };
    default:
      return { kind: 'AnyKeyword', typeName: 'any' };
  }
}

/**
 * 检查属性是否为可选属性
 */
function isOptionalProperty(propertyName: string, value: any): boolean {
  // 如果值是 undefined，认为是可选的
  if (value === undefined) {
    return true;
  }
  
  // 常见的可选属性模式
  const optionalPatterns = ['user', 'posts', 'comments', 'metadata', 'avatar'];
  const lowerPropertyName = propertyName.toLowerCase();
  
  return optionalPatterns.some(pattern => 
    lowerPropertyName.includes(pattern)
  );
}

/**
 * 创建导入声明 AST
 */
export function createImportDeclaration(
  moduleSpecifier: string,
  namedImports: { name: string; isTypeOnly: boolean }[]
): ImportDeclaration {
  return {
    kind: 'ImportDeclaration',
    moduleSpecifier,
    importClause: {
      namedBindings: {
        elements: namedImports
      }
    }
  };
}

/**
 * 创建完整的源文件 AST
 */
export function createSourceFileAST(
  fileName: string,
  imports: ImportDeclaration[],
  declarations: (ClassDeclaration | InterfaceDeclaration)[]
): SourceFile {
  return {
    kind: 'SourceFile',
    fileName,
    statements: [...imports, ...declarations]
  };
}

/**
 * 将 AST 转换为 JSON 字符串
 */
export function astToJsonString(ast: ASTNode, indent: number = 2): string {
  return JSON.stringify(ast, null, indent);
}

/**
 * 将 AST 转换为 TypeScript 代码字符串
 */
export function astToTypeScriptCode(ast: ClassDeclaration | InterfaceDeclaration): string {
  let code = '';
  
  // 添加修饰符
  if (ast.modifiers && ast.modifiers.length > 0) {
    code += ast.modifiers.join(' ') + ' ';
  }
  
  // 添加声明类型和名称
  if (ast.kind === 'ClassDeclaration') {
    code += `class ${ast.name} {\n`;
  } else if (ast.kind === 'InterfaceDeclaration') {
    code += `interface ${ast.name} {\n`;
  }
  
  // 添加成员
  ast.members.forEach(member => {
    const optional = member.optional ? '?' : '';
    const typeStr = getTypeString(member.type);
    
    if (ast.kind === 'ClassDeclaration') {
      // 类成员使用赋值语法
      const defaultValue = getDefaultValue(member.type);
      code += `  ${member.name}${optional} = ${defaultValue};\n`;
    } else {
      // 接口成员使用类型注解语法
      code += `  ${member.name}${optional}: ${typeStr};\n`;
    }
  });
  
  code += '}';
  
  return code;
}

/**
 * 获取类型字符串表示
 */
function getTypeString(typeNode: TypeNode): string {
  switch (typeNode.kind) {
    case 'StringKeyword':
      return 'string';
    case 'NumberKeyword':
      return 'number';
    case 'BooleanKeyword':
      return 'boolean';
    case 'NullKeyword':
      return 'null';
    case 'UndefinedKeyword':
      return 'undefined';
    case 'AnyKeyword':
      return 'any';
    case 'ArrayType':
      return `${getTypeString(typeNode.elementType!)}[]`;
    case 'TypeReference':
      return typeNode.typeName || 'unknown';
    case 'TypeLiteral':
      return 'object';
    default:
      return 'any';
  }
}

/**
 * 获取默认值字符串表示
 */
function getDefaultValue(typeNode: TypeNode): string {
  switch (typeNode.kind) {
    case 'StringKeyword':
      return '""';
    case 'NumberKeyword':
      return '0';
    case 'BooleanKeyword':
      return 'false';
    case 'ArrayType':
      return '[]';
    case 'TypeLiteral':
      return '{}';
    case 'NullKeyword':
      return 'null';
    case 'UndefinedKeyword':
      return 'undefined';
    default:
      return 'undefined';
  }
}

/**
 * 创建联合类型 AST
 */
export function createUnionType(types: TypeNode[]): TypeNode {
  return {
    kind: 'UnionType',
    types
  };
}

/**
 * 创建可选类型 AST (T | undefined)
 */
export function createOptionalType(baseType: TypeNode): TypeNode {
  return createUnionType([
    baseType,
    { kind: 'UndefinedKeyword', typeName: 'undefined' }
  ]);
} 