import { FieldNode } from "graphql";

export const doesPathExist = (nodes: readonly FieldNode[], path: string[]): boolean => {
  const node = nodes.find((n) => n.name.value === path[0]);
  if (!node) return false;
  if (path.length === 1) return true;

  return doesPathExist(node.selectionSet!.selections as FieldNode[], path.slice(1));
};
