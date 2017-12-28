
export class NodeModuleRegistry {
  set(_resolvedKey, _namespace) { return }
  get(_resolvedKey) { return }
  has(_resolvedKey) { return }
  delete(_resolvedKey) { return }
  keys() { return }
  values() { return }
  entries() { return }
}

export class NodeModuleLoader {
  registry = new NodeModuleRegistry()
  import(_key, _parentKey?) { return }
  resolve(_key, _parentKey?) { return }
}
