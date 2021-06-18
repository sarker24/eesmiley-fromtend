interface Entity {
  id: number;
}

function groupById<T extends Entity>(entities: Entity[]): { [index: number]: T } {
  return entities.reduce((obj, entity) => ({ ...obj, [entity.id]: entity }), {});
}

export { groupById };
