export interface TreeNode {
  id: number | string;
  path?: string;
}

export function isNodeAncestor(node: TreeNode, ancestor: TreeNode): boolean {
  const nodePath = [...(node.path ? node.path.split('.') : []), node.id];
  return nodePath.some((id) => id === ancestor.id);
}

export function isNodePartOfTree(node: TreeNode, tree: TreeNode): boolean {
  const treeRoot = tree.path ? tree.path.split('.')[0] : tree.id;
  const nodeRoot = node.path ? node.path.split('.')[0] : node.id;

  return treeRoot === nodeRoot;
}
