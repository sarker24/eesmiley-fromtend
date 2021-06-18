import * as _ from 'lodash';

/*
 to get ancestor ids of a given node, we extract ids from the path property
 of each node
 */
export function extractPathIds(nodes: Array<Tree<any>>): Array<number> {
  const nodeIdsOnPath: Array<string> = _.flatMap(nodes, node => node.path ? [...node.path.split('.')] : []);
  const parsedNodeIds: Array<number> = nodeIdsOnPath.map(id => parseInt(id));
  return [...new Set(parsedNodeIds)];
}
