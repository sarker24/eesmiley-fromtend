import { AxiosError, AxiosResponse } from 'axios';
import { DataStorage, DataTransfer } from 'frontend-core';
import moment from 'moment';
import * as errorDispatch from 'redux/ducks/error';
import {
  setActiveChildFollowUpProject,
  calculateMinimumDurationStartDate
} from 'utils/projectUtils';
import {
  Project,
  ProjectActionTypes,
  ProjectsActions,
  ProjectsState,
  ProjectTimelineEvent
} from './types';
import { ApiError, ErrorActions } from 'redux/ducks/error';
import { ThunkResult } from 'redux/types';

export * from './types';

const transfer = new DataTransfer();
const store = new DataStorage();

export const initialState: ProjectsState = {
  projects: [],
  registrationPoints: [],
  registrations: [],
  timeline: [],
  projectUpdatedAt: 0,
  editMode: false,
  projectsLoaded: false,
  project: undefined
};

export default function reducer(
  state: ProjectsState = initialState,
  action: ProjectsActions
): ProjectsState {
  switch (action.type) {
    case ProjectActionTypes.GET_PROJECTS:
      return {
        ...state,
        projects: action.payload ? filterProjects(action.payload) : [],
        projectsLoaded: true
      };

    case ProjectActionTypes.CREATE_PROJECT:
      return {
        ...state,
        project: action.payload
      };

    case ProjectActionTypes.SET_PROJECT: {
      let project = action.payload;
      let minDate = state.minDate;
      if (project) {
        minDate = null;

        if (project.parentProjectId) {
          const parentProject = state.projects.filter((project2: Project) => {
            return project2.id == project.parentProjectId;
          });

          if (parentProject[0]) {
            project = setActiveChildFollowUpProject(parentProject[0]);
            minDate = calculateMinimumDurationStartDate(parentProject[0]);
          }
        } else {
          project = setActiveChildFollowUpProject(project);
        }
      }

      return {
        ...state,
        project,
        minDate,
        projectUpdatedAt: moment().unix()
      };
    }

    case ProjectActionTypes.CLEAR_PROJECT:
      return { ...state, project: undefined };

    case ProjectActionTypes.GET_PROJECT_TIMELINE:
      return { ...state, timeline: action.payload };

    case ProjectActionTypes.UPDATE_PROJECT: {
      // TODO: dont mutate state
      if (action.payload) {
        if (state.project && state.project.id == action.payload.id) {
          state.project = action.payload;
        }

        if (state.projects) {
          state.projects.map((project: Project, index: number) => {
            if (project.id == action.payload.id) {
              state.projects[index] = action.payload;
            }
            if (project.id == action.payload.parentProjectId && project.followUpProjects) {
              project.followUpProjects.map((followUpProject: Project, index2: number) => {
                if (followUpProject.id == action.payload.id) {
                  state.projects[index].followUpProjects[index2] = action.payload;
                }
              });
            }
          });
        }
      }

      return {
        ...state,
        project: setActiveChildFollowUpProject(state.project),
        projectUpdatedAt: moment().unix()
      };
    }
    case ProjectActionTypes.SET_EDIT_MODE: {
      return { ...state, editMode: action.payload };
    }

    default:
      return state;
  }
}

export function getProjects(
  params = {}
): ThunkResult<Promise<ProjectsActions | ErrorActions>, ProjectsActions> {
  return async (dispatch) => {
    try {
      const response = (await transfer.get(
        '/foodwaste/projects',
        { params: params },
        true
      )) as AxiosResponse<Project[]>;

      return dispatch({
        type: ProjectActionTypes.GET_PROJECTS,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function filterProjects(projects: Project[]): Project[] {
  return projects
    .map(setActiveChildFollowUpProject)
    .filter((project) => !!project.activeChild || !project.parentProjectId);
}

// todo: this belongs to core.DataTransfer
function scheduleRequests(axiosInstance, intervalMs) {
  let lastInvocationTime: any = undefined;

  const scheduler = (config) => {
    const now = Date.now();
    if (lastInvocationTime) {
      lastInvocationTime += intervalMs;
      const waitPeriodForThisRequest = lastInvocationTime - now;
      if (waitPeriodForThisRequest > 0) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(config), waitPeriodForThisRequest);
        });
      }
    }

    lastInvocationTime = now;
    // eslint-disable-next-line
    return config;
  };

  // eslint-disable-next-line
  axiosInstance.interceptors.request.use(scheduler);
}

export function createProject(
  data: Partial<Project>
): ThunkResult<Promise<ProjectsActions | ErrorActions>, ProjectsActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const actions = data.actions || [];
    const projectData = { ...data, actions: actions.filter((action) => !!action.id) };

    try {
      const { data: project } = (await transfer.post(
        '/foodwaste/projects',
        projectData
      )) as AxiosResponse<Project>;

      const actionsToCreate = actions.filter((action) => !action.id);
      const actionService = new DataTransfer({ baseURL: window.sysvars.API_URL });
      // replace with sequential exec if order matters
      scheduleRequests(actionService.library, 250);

      // this apparently is never used? instead we use project patch
      await Promise.all(
        actionsToCreate.map((action) =>
          actionService.post(`/foodwaste/projects/${projectData.id}/actions`, action)
        )
      );

      return dispatch({
        type: ProjectActionTypes.CREATE_PROJECT,
        payload: project
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function setProject(project?: Project): ProjectsActions {
  return {
    type: ProjectActionTypes.SET_PROJECT,
    payload: project
  };
}

export function clearProject(): ProjectsActions {
  return {
    type: ProjectActionTypes.CLEAR_PROJECT
  };
}

export function setEditMode(editMode: boolean): ProjectsActions {
  return {
    type: ProjectActionTypes.SET_EDIT_MODE,
    payload: editMode
  };
}

export function updateProject(
  id: number,
  patch: { op: string; path: string; value: any }[]
): ThunkResult<Promise<ProjectsActions | ErrorActions>, ProjectsActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const response = (await transfer.patch(
        `/foodwaste/projects/${id}`,
        patch
      )) as AxiosResponse<Project>;

      return dispatch({
        type: ProjectActionTypes.UPDATE_PROJECT,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}

export function getProjectTimeline(
  id: number
): ThunkResult<Promise<ProjectsActions | ErrorActions>, ProjectsActions> {
  return async (dispatch) => {
    const token = store.getData('token') as string;
    // eslint-disable-next-line
    transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const response = (await transfer.get(`/foodwaste/projects/${id}/timeline`)) as AxiosResponse<
        ProjectTimelineEvent[]
      >;
      return dispatch({
        type: ProjectActionTypes.GET_PROJECT_TIMELINE,
        payload: response.data
      });
    } catch (err: unknown) {
      const { errorCode, message } = (err as AxiosError<ApiError>).response.data;
      return dispatch(errorDispatch.showError(errorCode, message));
    }
  };
}
