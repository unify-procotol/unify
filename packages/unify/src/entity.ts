// Entity instance management using WeakMap for automatic garbage collection
interface EntityConstructor<T = any, P = any> {
  new (args: P): T;
}

// Use WeakMap to automatically handle garbage collection
const entityInstances = new WeakMap<any, any>();
const entityManagers = new Map<EntityConstructor<any, any>, any>();

interface EntityManager<T, P> {
  Get(args: P): T;
}

/**
 * Entity function that manages instance reuse using WeakMap
 * @param EntityClass - The entity class constructor
 * @returns An entity manager with Get method for instance retrieval
 */
export function entity<T, P>(EntityClass: EntityConstructor<T, P>): EntityManager<T, P> {
  // Create or get the entity manager for this class
  if (!entityManagers.has(EntityClass)) {
    entityManagers.set(EntityClass, {
      Get(args: P): T {
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
          // For primitive args, create a new instance each time
          return new EntityClass(args);
        }
      },
    });
  }

  return entityManagers.get(EntityClass)!;
}

// Export additional utilities for advanced usage
export function getEntityPoolStats<T, P>(EntityClass: EntityConstructor<T, P>) {
  // With WeakMap, we can't easily get statistics since keys are not enumerable
  // This is a limitation but also a feature - automatic garbage collection
  return {
    message:
      "Statistics not available with WeakMap implementation (automatic GC)",
    hasManager: entityManagers.has(EntityClass),
  };
}

export function clearEntityPool<T, P>(EntityClass: EntityConstructor<T, P>) {
  entityManagers.delete(EntityClass);
}

export function clearAllEntityPools() {
  entityManagers.clear();
}
