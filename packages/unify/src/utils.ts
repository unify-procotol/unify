import { DataSourceAdapter, Repository } from "@unilab/core";

const REPO_REGISTRY = new Map<string, Repository<any>>();

export function registerAdapter<T extends Record<string, any>>(
  source: string,
  adapter: DataSourceAdapter<T>
) {
  const repo = new Repository<T>(adapter);
  REPO_REGISTRY.set(source, repo);
  return repo;
}

export function getRepo(source: string) {
  const repo = REPO_REGISTRY.get(source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source}`);
  }
  return repo;
}

export function getRepoRegistry() {
  return REPO_REGISTRY;
}
