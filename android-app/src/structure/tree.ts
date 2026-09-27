import type { LocationNode, Structure } from '../types';

/** Human labels for the cmn_location_type values used in the hierarchy. */
const TYPE_LABELS: Record<string, string> = {
  country: 'País',
  region: 'Região',
  campus: 'Campus',
  site: 'Localidade',
  'building/structure': 'Prédio',
  building: 'Prédio',
  floor: 'Andar',
  zone: 'Zona',
  room: 'Sala',
  place: 'Local',
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? 'Local';
}

export interface Tree {
  byId: Map<string, LocationNode>;
  children: Map<string, LocationNode[]>;
  root?: LocationNode;
}

export function buildTree(structure: Structure | null): Tree {
  const byId = new Map<string, LocationNode>();
  const children = new Map<string, LocationNode[]>();
  if (!structure) {
    return { byId, children };
  }
  for (const node of structure.locations) {
    if (node.active) {
      byId.set(node.sys_id, node);
    }
  }
  for (const node of byId.values()) {
    if (node.sys_id === structure.root || !node.parent) {
      continue;
    }
    const list = children.get(node.parent) ?? [];
    list.push(node);
    children.set(node.parent, list);
  }
  for (const list of children.values()) {
    list.sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { numeric: true }),
    );
  }
  return { byId, children, root: byId.get(structure.root) };
}

export function childrenOf(tree: Tree, id: string): LocationNode[] {
  return tree.children.get(id) ?? [];
}

/** Path from the root down to `id` (inclusive). Empty when the node is unknown. */
export function pathTo(tree: Tree, id: string): LocationNode[] {
  const path: LocationNode[] = [];
  const seen = new Set<string>();
  let node = tree.byId.get(id);
  while (node && !seen.has(node.sys_id)) {
    seen.add(node.sys_id);
    path.unshift(node);
    if (node === tree.root) {
      break;
    }
    node = tree.byId.get(node.parent);
  }
  return path[0] === tree.root ? path : [];
}

/** Scanning is registered against rooms; any leaf also counts, so odd trees still work. */
export function isCaptureTarget(tree: Tree, node: LocationNode): boolean {
  return node.type === 'room' || childrenOf(tree, node.sys_id).length === 0;
}

/** Applies an incremental GET /structure?since= response on top of the cached tree. */
export function mergeStructure(
  previous: Structure | null,
  incoming: Structure,
  full: boolean,
): Structure {
  const syncedAt = new Date().toISOString();
  if (full || !previous || previous.root !== incoming.root) {
    return { ...incoming, syncedAt };
  }
  const merged = new Map(previous.locations.map(l => [l.sys_id, l]));
  for (const node of incoming.locations) {
    merged.set(node.sys_id, node);
  }
  return {
    root: incoming.root,
    serverTime: incoming.serverTime,
    syncedAt,
    locations: [...merged.values()],
  };
}
