interface EntityConstructor<T = any, P = any> {
  new (args: P): T;
}

// Use WeakMap to automatically handle garbage collection
const entityInstances = new WeakMap<any, any>();

/**
 * Entity function that manages instance reuse using WeakMap
 * @param EntityClass - The entity class constructor
 * @param args - The arguments to pass to the constructor
 * @returns The entity instance
 */
export function entity<T, P>(EntityClass: EntityConstructor<T, P>, args: P): T {
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
    throw new Error("Primitive args are not supported");
  }
}
