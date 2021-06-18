/* label tree service */
import { getSubLabels, LABELS } from 'utils/labels';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { isNodeAncestor } from 'utils/tree';
import { RegistrationPointsByLabel } from 'redux/ducks/reports-new/selectors';

export function recalculatePointHierarchy(
  filter: RegistrationPointsByLabel
): RegistrationPointsByLabel {
  return LABELS.reduce<RegistrationPointsByLabel>(
    (result, label) => {
      const nodesInParent: RegistrationPoint[] = result[label];
      const childrenToValidate = getSubLabels(label);

      if (nodesInParent.length === 0 || childrenToValidate.length === 0) {
        return result;
      }

      const nextChildren: RegistrationPointsByLabel = childrenToValidate.reduce<RegistrationPointsByLabel>(
        (children, childLabel) => {
          const childrenNodes: RegistrationPoint[] = result[childLabel];
          const filteredChildren: RegistrationPoint[] = childrenNodes.filter(
            (child) => child.path && nodesInParent.some((parent) => isNodeAncestor(child, parent))
          );
          children[childLabel] = filteredChildren;
          return children;
        },
        {} as RegistrationPointsByLabel
      );

      return { ...result, ...nextChildren };
    },
    { ...filter }
  );
}
