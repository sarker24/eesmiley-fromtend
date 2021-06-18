export const AREA = 'area';
export const CATEGORY = 'category';
export const PRODUCT = 'product';

export const LABELS = [AREA, CATEGORY, PRODUCT] as const;

export type Labels = typeof LABELS[number];

export const LABEL_TO_PLURAL = {
  [AREA]: 'areas',
  [CATEGORY]: 'categories',
  [PRODUCT]: 'products'
};

/**
 * Returns an array with the allowed labels based on the parent and children labels
 * */
export function getAllowedLabels(parentLabel: Labels = AREA, childLabels: Labels[] = []): Labels[] {
  const indexOfParentLabel = LABELS.indexOf(parentLabel);
  const smallestIndexOfChildLabels = Math.min(
    ...childLabels.map((childLabel) => LABELS.indexOf(childLabel))
  );

  return LABELS.slice(
    indexOfParentLabel,
    childLabels.length ? smallestIndexOfChildLabels + 1 : undefined
  );
}

export function getParentLabels(currentLabel: Labels): Labels[] {
  const labelIndex = LABELS.findIndex((name) => name === currentLabel);
  return LABELS.slice(0, labelIndex);
}

export function getSubLabels(currentLabel: Labels): Labels[] {
  const labelIndex = LABELS.findIndex((name) => name === currentLabel);

  if (labelIndex + 1 >= LABELS.length) {
    return [];
  }

  return LABELS.slice(labelIndex + 1);
}
