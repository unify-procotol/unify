// Entity instance management using WeakMap for automatic garbage collection
interface EntityConstructor<T = any> {
  new (...args: any[]): T;
}

// Use WeakMap to automatically handle garbage collection
const entityInstances = new WeakMap<any, any>();
const entityManagers = new Map<EntityConstructor, any>();

interface EntityManager<T> {
  Get(args: any): T;
}

/**
 * Entity function that manages instance reuse using WeakMap
 * @param EntityClass - The entity class constructor
 * @returns An entity manager with Get method for instance retrieval
 */
export function entity<T>(EntityClass: EntityConstructor<T>): EntityManager<T> {
  // Create or get the entity manager for this class
  if (!entityManagers.has(EntityClass)) {
    entityManagers.set(EntityClass, {
      Get(args: any): T {
        // Use args object as key for WeakMap (if it's an object)
        if (args && typeof args === "object") {
          // Check if we already have an instance for this args object
          if (entityInstances.has(args)) {
            const existingInstance = entityInstances.get(args);
            // Return existing instance without overwriting its current state
            return existingInstance;
          }

          // Create new instance and store it in WeakMap
          const newInstance = new EntityClass(args);
          entityInstances.set(args, newInstance);
          return newInstance;
        } else {
          // For non-object args or no args, create a new instance each time
          return args ? new EntityClass(args) : new EntityClass();
        }
      },
    });
  }

  return entityManagers.get(EntityClass)!;
}

// Export additional utilities for advanced usage
export function getEntityPoolStats<T>(EntityClass: EntityConstructor<T>) {
  // With WeakMap, we can't easily get statistics since keys are not enumerable
  // This is a limitation but also a feature - automatic garbage collection
  return {
    message:
      "Statistics not available with WeakMap implementation (automatic GC)",
    hasManager: entityManagers.has(EntityClass),
  };
}

export function clearEntityPool<T>(EntityClass: EntityConstructor<T>) {
  entityManagers.delete(EntityClass);
}

export function clearAllEntityPools() {
  entityManagers.clear();
}
