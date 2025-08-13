import { BaseAdapter } from "../../adapter";
import { FindManyArgs, FindOneArgs } from "../../types";
import { _SchemaEntity } from "../entities/_schema";
import { URPC } from "../type";

export class GlobalSchemaAdapter extends BaseAdapter<_SchemaEntity> {
  static displayName = "GlobalSchemaAdapter";
  private URPC: URPC;

  constructor(URPC: URPC) {
    super();
    this.URPC = URPC;
  }

  private getSourcesForEntity(entity: string): string[] {
    const entitySources = this.URPC.getEntitySources();
    return entitySources[entity] || [];
  }

  async findMany(args?: FindManyArgs<_SchemaEntity>): Promise<_SchemaEntity[]> {
    const where = args?.where || {};
    const schemas = this.URPC.getEntitySchemas();
    const entity = where.name;
    if (entity) {
      const actualEntityName = typeof entity === "string" ? entity : entity.eq;
      if (actualEntityName) {
        const schema = schemas[actualEntityName];
        if (schema) {
          return [
            {
              name: actualEntityName,
              schema: schemas[actualEntityName],
              sources: this.getSourcesForEntity(actualEntityName),
            },
          ];
        } else {
          return [];
        }
      }
    }
    return Object.keys(schemas).map((name) => {
      return {
        name,
        schema: schemas[name],
        sources: this.getSourcesForEntity(name),
      };
    });
  }

  async findOne(
    args: FindOneArgs<_SchemaEntity>
  ): Promise<_SchemaEntity | null> {
    const where = args.where;
    const schemas = this.URPC.getEntitySchemas();
    const entityName = where.name;
    if (entityName) {
      if (entityName && schemas[entityName]) {
        return {
          name: entityName,
          schema: schemas[entityName],
          sources: this.getSourcesForEntity(entityName),
        };
      }
    }
    return null;
  }
}
