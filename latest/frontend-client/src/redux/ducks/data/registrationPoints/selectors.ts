import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash/isEqual';
import { RootState } from 'redux/rootReducer';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints/types';

const getRegistrationPointsTree = (state: RootState) => {
  return state.data.registrationPoints.tree || [];
};

// create a custom "selector creator" that uses lodash.isEqual instead of the default equality check "==="
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

// depth first order required for material table search to work
function depthFirstTreeFlattener(guardFn: (tree: RegistrationPoint) => boolean = null) {
  return (treeList: RegistrationPoint[]): RegistrationPoint[] => {
    return treeList.reduce<RegistrationPoint[]>(function traverse(
      nodeList,
      tree
    ): RegistrationPoint[] {
      if (guardFn && guardFn(tree)) {
        return nodeList;
      }
      return nodeList.concat(tree, (tree.children || []).reduce(traverse, []));
    },
    []);
  };
}

const flattenAll = depthFirstTreeFlattener();
const flattenActive = depthFirstTreeFlattener((tree) => !tree.active);
const flattenNonDeleted = depthFirstTreeFlattener((tree) => !!tree.deletedAt);

export const getAllRegistrationPointsDepthFirst = createDeepEqualSelector(
  [getRegistrationPointsTree],
  flattenAll
);

export const getActiveRegistrationPointsDepthFirst = createDeepEqualSelector(
  [getRegistrationPointsTree],
  flattenActive
);

export const getNonDeletedRegistrationPointsDepthFirst = createDeepEqualSelector(
  [getRegistrationPointsTree],
  flattenNonDeleted
);
