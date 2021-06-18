import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import * as React from 'react';

export function onSubmitForm(onSubmit: (event: React.FormEvent) => void) {
  return (event: React.FormEvent): boolean => {
    onSubmit(event);
    event.preventDefault();
    return false;
  };
}

export function getFullRegistrationPath(
  registrationPoints: Map<string, RegistrationPoint>,
  registrationPoint: { id: string; registrationPointId?: string }
): RegistrationPoint[] {
  const path = [] as RegistrationPoint[];
  const selectedRegistrationPoint = registrationPoints.get(
    registrationPoint.registrationPointId || registrationPoint.id
  );
  if (selectedRegistrationPoint) {
    if (selectedRegistrationPoint && selectedRegistrationPoint.path != null) {
      const paths = selectedRegistrationPoint.path.split('.');
      paths.forEach((pathId) => path.push(registrationPoints.get(pathId)));
    }
    path.push(selectedRegistrationPoint);
  }
  return path;
}

export function createMap<T extends { id: string; children?: T[] }>(
  array: T[],
  hash: Map<string, T> = new Map<string, T>()
): Map<string, T> {
  for (const node of array) {
    hash.set(node.id, node);
    if (node.hasOwnProperty('children')) {
      createMap(node.children, hash);
    }
  }
  return hash;
}

export function scrollToEl(id: string): void {
  const el = document.getElementById(id);

  if (el) {
    window.scroll({ top: el.offsetTop, behavior: 'smooth' });
  }
}
