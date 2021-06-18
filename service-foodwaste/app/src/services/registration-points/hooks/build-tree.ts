import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

/**
 * Generate a list of tree structures from the list of node elements
 *
 * After hook: all
 */


export function parseTreesFromArray(nodes: Array<Tree<any>>): Array<Tree<any>> {
  const nodesById: { [index: number]: Tree<any> } = {};
  const trees: Array<Tree<any>> = [];

  nodes.forEach(node => nodesById[node.id] = node);

  nodes.forEach(node => {
    if (node.parentId) {
      if (!nodesById[node.parentId].children) {
        nodesById[node.parentId].children = [];
      }
      nodesById[node.parentId].children.push(nodesById[node.id]);
    } else {
      trees.push(nodesById[node.id]);
    }
  });

  return trees;
}

export default (): Hook => {
  return (hook: HookContext) => {
    if (!hook.result) {
      return hook;
    }
    if (!Array.isArray(hook.result)) {
      hook.result = [hook.result];
    }

    const treeArray = parseTreesFromArray(hook.result);
    if (hook.method !== 'find') {
      if (treeArray.length > 1) {
        const { requestId, sessionId } = hook.params;
        throw new errors.GeneralError('Cannot retrieve multiple trees when a single tree is requested', {
          requestId, sessionId, subModule: 'build-tree', registrationPointId: hook.id, errorCode: 'E257'
        });
      } else {
        hook.result = treeArray[0];
      }
    } else {
      hook.result = treeArray;
    }
    return hook;
  };
};
