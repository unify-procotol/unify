// 实体注册器 - 用于自动注册实体装饰器
export class EntityRegistry {
  private static entities: Map<string, any> = new Map();

  /**
   * 注册实体类
   * @param entities 实体类数组
   */
  static register(...entities: any[]) {
    entities.forEach((EntityClass) => {
      const entityName = EntityClass.name;
      if (!this.entities.has(entityName)) {
        this.entities.set(entityName, EntityClass);
        // 创建临时实例以触发装饰器
        new EntityClass();
        console.debug(`Entity ${entityName} registered`);
      }
    });
  }

  /**
   * 获取已注册的实体
   */
  static getRegisteredEntities() {
    return Array.from(this.entities.values());
  }
}
