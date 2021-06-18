import { getAllowedLabels, Labels } from './labels';

describe('getAllowedLabels', () => {
  const allLabels: Labels[] = ['area', 'category', 'product'];
  const catAndProductLabels: Labels[] = ['category', 'product'];
  const productLabel: Labels[] = ['product'];

  test('It returns correct labels for the "area" parent label', () => {
    const parentLabel = 'area';

    // Testing against possible children
    const allLabelsTest = getAllowedLabels(parentLabel, allLabels);
    const catAndProductLabelsTest = getAllowedLabels(parentLabel, catAndProductLabels);
    const productLabelTest = getAllowedLabels(parentLabel, productLabel);
    const noChildrenTest = getAllowedLabels(parentLabel);

    expect(allLabelsTest).toEqual(['area']);
    expect(catAndProductLabelsTest).toEqual(['area', 'category']);
    expect(productLabelTest).toEqual(['area', 'category', 'product']);
    expect(noChildrenTest).toEqual(['area', 'category', 'product']);
  });

  test('It returns correct labels for the "category" parent label', () => {
    const parentLabel = 'category';

    // Testing against possible children
    const catAndProductLabelsTest = getAllowedLabels(parentLabel, catAndProductLabels);
    const productLabelTest = getAllowedLabels(parentLabel, productLabel);
    const noChildrenTest = getAllowedLabels(parentLabel);

    expect(catAndProductLabelsTest).toEqual(['category']);
    expect(productLabelTest).toEqual(['category', 'product']);
    expect(noChildrenTest).toEqual(['category', 'product']);
  });

  test('It returns correct labels for the "product" parent label', () => {
    const parentLabel = 'product';

    // Testing against possible children
    const productLabelTest = getAllowedLabels(parentLabel, productLabel);
    const noChildrenTest = getAllowedLabels(parentLabel);

    expect(productLabelTest).toEqual(['product']);
    expect(noChildrenTest).toEqual(['product']);
  });

  test('It returns correct labels when there is no parent present', () => {
    const parentLabel = undefined;

    // Testing against possible children
    const allLabelsTest = getAllowedLabels(parentLabel, allLabels);
    const catAndProductLabelsTest = getAllowedLabels(parentLabel, catAndProductLabels);
    const productLabelTest = getAllowedLabels(parentLabel, productLabel);
    const noChildrenTest = getAllowedLabels(parentLabel);

    expect(allLabelsTest).toEqual(['area']);
    expect(catAndProductLabelsTest).toEqual(['area', 'category']);
    expect(productLabelTest).toEqual(['area', 'category', 'product']);
    expect(noChildrenTest).toEqual(['area', 'category', 'product']);
  });
});
