import { recalculatePointHierarchy } from './label-tree';
import { RegistrationPointsByLabel } from 'redux/ducks/reports-new/selectors';

describe('recalculatePointHierarchy', () => {
  test('filter out categories and products when an area was removed', () => {
    const filter = {
      area: [
        { id: '1', path: null },
        { id: '2', path: null }
      ],
      category: [
        { id: '10', path: '1' },
        { id: '40', path: '4' }
      ],
      product: [
        { id: '100', path: '1.10' },
        { id: '200', path: '1.10' },
        { id: '300', path: '4.40' },
        {
          id: '400',
          path: '4.40'
        }
      ]
    } as RegistrationPointsByLabel;

    const nextFilter = recalculatePointHierarchy(filter);
    expect(nextFilter).toEqual({
      area: [
        { id: '1', path: null },
        { id: '2', path: null }
      ],
      category: [{ id: '10', path: '1' }],
      product: [
        { id: '100', path: '1.10' },
        { id: '200', path: '1.10' }
      ]
    });
  });

  test('filter out products with no categories selected when an area was removed', () => {
    const filter = {
      area: [
        { id: '1', path: null },
        { id: '2', path: null }
      ],
      category: [],
      product: [
        { id: '100', path: '4.20' },
        { id: '200', path: '1.10' },
        { id: '400', path: '2.20' }
      ]
    } as RegistrationPointsByLabel;

    const nextFilter = recalculatePointHierarchy(filter);
    expect(nextFilter).toEqual({
      area: [
        { id: '1', path: null },
        { id: '2', path: null }
      ],
      category: [],
      product: [
        { id: '200', path: '1.10' },
        { id: '400', path: '2.20' }
      ]
    });
  });

  test('filter out products with area parents when an area was removed', () => {
    const filter = {
      area: [
        { id: '1', path: null },
        { id: '2', path: null }
      ],
      category: [],
      product: [
        { id: '100', path: '1' },
        { id: '200', path: '2' },
        { id: '300', path: '3' }
      ]
    } as RegistrationPointsByLabel;

    const nextFilter = recalculatePointHierarchy(filter);
    expect(nextFilter).toEqual({
      area: [
        { id: '1', path: null },
        { id: '2', path: null }
      ],
      category: [],
      product: [
        { id: '100', path: '1' },
        { id: '200', path: '2' }
      ]
    });
  });

  test('filter out categories and products without parents when area was added', () => {
    const filter = {
      area: [{ id: '1', path: null }],
      category: [
        { id: '10', path: '1' },
        { id: '20', path: '2' },
        { id: '30', path: null }
      ],
      product: [
        { id: '100', path: '1.10' },
        { id: '200', path: '2.20' },
        { id: '300', path: '30' },
        {
          id: '400',
          path: null
        }
      ]
    } as RegistrationPointsByLabel;

    const nextFilter = recalculatePointHierarchy(filter);
    expect(nextFilter).toEqual({
      area: [{ id: '1', path: null }],
      category: [{ id: '10', path: '1' }],
      product: [{ id: '100', path: '1.10' }]
    });
  });

  test('filter out products when a category was removed', () => {
    const filter = {
      area: [
        { id: '1', path: null },
        { id: '4', path: null }
      ],
      category: [{ id: '10', path: '1' }],
      product: [
        { id: '100', path: '1.10' },
        { id: '200', path: '4.20' },
        { id: '300', path: '4.20' }
      ]
    } as RegistrationPointsByLabel;
    const nextFilter = recalculatePointHierarchy(filter);
    expect(nextFilter).toEqual({
      area: [
        { id: '1', path: null },
        { id: '4', path: null }
      ],
      category: [{ id: '10', path: '1' }],
      product: [{ id: '100', path: '1.10' }]
    });
  });
});
