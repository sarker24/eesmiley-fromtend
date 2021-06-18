import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash/isEqual';
import { getAllRegistrationPointsDepthFirst } from 'redux/ducks/data/registrationPoints/selectors';
import { RootState } from 'redux/rootReducer';

// selector
const getProject = (state: RootState) => {
  return state.projects.project;
};

const getProjects = (state: RootState) => {
  return state.projects.projects;
};

// create a custom "selector creator" that uses lodash.isEqual instead of the default equality check "==="
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const getProjectState = createDeepEqualSelector(
  [getProject, getAllRegistrationPointsDepthFirst],
  (project, registrationPoints) => {
    if (project) {
      project.registrationPoints =
        registrationPoints &&
        registrationPoints.filter((registrationPoint) => {
          return project.registrationPoints.some((projectProduct) => {
            return projectProduct.id.toString() === registrationPoint.id.toString();
          });
        });
    }
    return project;
  }
);

export const getProjectsState = createDeepEqualSelector([getProjects], (projects) => {
  return projects;
});
