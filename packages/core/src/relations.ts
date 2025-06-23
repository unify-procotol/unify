import type { BaseEntity, RelationConfig, RelationMetadata } from "./types";
import { relationMetadataMap } from "./types";

/**
 * Relations 装饰器类，用于定义实体间的关系
 */
export class Relations {
  /**
   * 一对多关系装饰器
   * @param target 目标实体类工厂函数
   * @param config 关系配置
   */
  static toMany<T extends BaseEntity, R extends BaseEntity>(
    targetEntity: () => new () => R,
    config?: RelationConfig<T, R>
  ) {
    return function (target: any, propertyKey: string | symbol) {
      const entityName = target.constructor.name;

      // 获取或创建实体的关系元数据
      if (!relationMetadataMap.has(entityName)) {
        relationMetadataMap.set(entityName, new Map());
      }

      const entityRelations = relationMetadataMap.get(entityName)!;

      // 存储关系元数据
      entityRelations.set(String(propertyKey), {
        type: "toMany",
        target: targetEntity,
        config,
      });
    };
  }

  /**
   * 一对一关系装饰器
   * @param target 目标实体类工厂函数
   * @param foreignKey 外键字段名
   */
  static toOne<T extends BaseEntity, R extends BaseEntity>(
    targetEntity: () => new () => R,
    foreignKey: string
  ) {
    return function (target: any, propertyKey: string | symbol) {
      const entityName = target.constructor.name;

      // 获取或创建实体的关系元数据
      if (!relationMetadataMap.has(entityName)) {
        relationMetadataMap.set(entityName, new Map());
      }

      const entityRelations = relationMetadataMap.get(entityName)!;

      // 存储关系元数据
      entityRelations.set(String(propertyKey), {
        type: "toOne",
        target: targetEntity,
        foreignKey,
      });
    };
  }

  /**
   * 获取实体的关系元数据
   * @param entityName 实体名称
   * @param propertyKey 属性名称
   */
  static getRelationMetadata(
    entityName: string,
    propertyKey: string
  ): RelationMetadata | undefined {
    const entityRelations = relationMetadataMap.get(entityName);
    return entityRelations?.get(propertyKey);
  }

  /**
   * 获取实体的所有关系元数据
   * @param entityName 实体名称
   */
  static getAllRelationMetadata(
    entityName: string
  ): Map<string, RelationMetadata> | undefined {
    return relationMetadataMap.get(entityName);
  }
}
