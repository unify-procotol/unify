import { Repository } from "./repository";
import { DataSourceAdapter } from "./types";

const REPO_REGISTRY = new Map<string, Repository<any>>();

export function registerAdapter<T extends Record<string, any>>(
  entity: string,
  source: string,
  adapter: DataSourceAdapter<T>
) {
  const key = getRepoKey(entity, source);
  const repo = new Repository<T>(adapter);
  REPO_REGISTRY.set(key, repo);
  return repo;
}

export function getRepo(entity: string, source: string) {
  const key = getRepoKey(entity, source);
  const repo = REPO_REGISTRY.get(key);
  return repo;
}

export function getRepoRegistry() {
  return REPO_REGISTRY;
}

function getRepoKey(entity: string, source: string) {
  const simplifiedEntityName = simplifyEntityName(entity);
  return `${simplifiedEntityName}:${source}`;
}

export function simplifyEntityName(entity: string) {
  return entity.replace(/Entity$/i, "").toLowerCase();
}
