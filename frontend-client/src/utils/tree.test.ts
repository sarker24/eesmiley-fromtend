import { isNodeAncestor, isNodePartOfTree } from './tree';

describe('isNodeAncestor', () => {
  it('should validate direct child of root node', () => {
    const node = { id: '2', path: '1' };
    const parent = { id: '1' };

    expect(isNodeAncestor(node, parent)).toEqual(true);
  });

  it('should validate nested child of root node', () => {
    const node = { id: '3', path: '1.2' };
    const parent = { id: '1' };

    expect(isNodeAncestor(node, parent)).toEqual(true);
  });

  it('should validate direct child of nested node', () => {
    const node = { id: '3', path: '1.2' };
    const parent = { id: '2', path: '1' };

    expect(isNodeAncestor(node, parent)).toEqual(true);
  });

  it('should validate nested child of nested node', () => {
    const node = { id: '5', path: '1.2.3.4' };
    const parent = { id: '3', path: '1.2' };

    expect(isNodeAncestor(node, parent)).toEqual(true);
  });

  it('should not validate child with different root', () => {
    const node = { id: '3', path: '1.2' };
    const parent = { id: '10' };
    expect(isNodeAncestor(node, parent)).toEqual(false);
  });
});

describe('isNodePartOfTree', () => {
  it('should validate if node belongs to tree', () => {
    const node = { id: '3', path: '1.2' };
    const tree = { id: '1' };

    expect(isNodePartOfTree(node, tree)).toEqual(true);
  });

  it('should not validate if node does not belongs to tree', () => {
    const node = { id: '3', path: '1.2' };
    const tree = { id: '10' };

    expect(isNodePartOfTree(node, tree)).toEqual(false);
  });
});
