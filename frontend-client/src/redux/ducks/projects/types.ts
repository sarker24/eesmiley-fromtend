import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { Registration } from 'redux/ducks/data/registrations';

export enum ProjectStatus {
  isPendingStart = 'PENDING_START',
  isPendingFollowUp = 'PENDING_FOLLOWUP',
  isPendingInput = 'PENDING_INPUT',
  isRunning = 'RUNNING',
  isRunningFollowUp = 'RUNNING_FOLLOWUP',
  isFinished = 'FINISHED',
  isOnHold = 'ON_HOLD',
  isNotStarted = 'NOT_STARTED',
  isInProgress = 'IN_PROGRESS',
  isDone = 'DONE'
}

export type DurationType = 'REGISTRATIONS' | 'CALENDAR';

// todo: draft type for editors
export interface ProjectAction {
  customerId?: string;
  description?: string;
  id?: string;
  name: string;
  userId?: string;
}

export interface ProjectDuration {
  start: number;
  end?: number;
  days?: number;
  type?: DurationType;
}

export interface ProjetRegistrationPoint {
  id: number | string;
  path?: string;
  name: string;
}

// todo: draft type for editors
export interface Project {
  followUpProjects?: Project[];
  id?: string | number;
  parentProjectId?: string | number;
  name: string;
  status: ProjectStatus;
  customerId?: string;
  percentage?: number;
  activeChild?: Project;
  period: number;
  registrationPoints: ProjetRegistrationPoint[];
  actions: ProjectAction[];
  periodDates?: { startDate: string; endDate: string };
  duration: ProjectDuration;
}

export interface ProjectsState {
  projects: Project[];
  registrationPoints: RegistrationPoint[];
  registrations: Registration[];
  timeline: ProjectTimelineEvent[];
  projectUpdatedAt: number;
  editMode: boolean;
  projectsLoaded: boolean;
  project: Project;
  minDate?: Date;
}

export interface ProjectTimelineBase {
  period?: number;
  createdAt: string;
}

export type ProjectRegistration = Registration & { registrationPoint: RegistrationPoint };

export type ProjectTimelineRegistrationEvent = ProjectTimelineBase & {
  type: 'registration';
  data: ProjectRegistration;
};
export type ProjectTimelineProjectEvent = ProjectTimelineBase & { type: 'project'; data: Project };
export type ProjectTimelineActionEvent = ProjectTimelineBase & {
  type: 'action';
  data: ProjectAction;
};
export type ProjectTimelinePeriodEvent = ProjectTimelineBase & { type: 'period'; data: Project };
export type ProjectTimelineEvent =
  | ProjectTimelineRegistrationEvent
  | ProjectTimelineProjectEvent
  | ProjectTimelineActionEvent
  | ProjectTimelinePeriodEvent;

export enum ProjectActionTypes {
  GET_PROJECTS = 'esmiley/projects/GET_PROJECTS',
  CREATE_PROJECT = 'esmiley/projects/CREATE_PROJECT',
  SET_PROJECT = 'esmiley/projects/SET_PROJECT',
  CLEAR_PROJECT = 'esmiley/projects/CLEAR_PROJECT',
  UPDATE_PROJECT = 'esmiley/projects/UPDATE_PROJECT',
  SET_EDIT_MODE = 'esmiley/projects/SET_EDIT_MODE',
  GET_PROJECT_TIMELINE = 'esmiley/projects/GET_PROJECT_TIMELINE'
}

type GetProjectsAction = {
  type: typeof ProjectActionTypes.GET_PROJECTS;
  payload: Project[];
};

type CreateProjectAction = {
  type: typeof ProjectActionTypes.CREATE_PROJECT;
  payload: Project;
};

type SetProjectAction = {
  type: typeof ProjectActionTypes.SET_PROJECT;
  payload?: Project; // todo: this should be id only, but requires lots of changes
};

type ClearProjectAction = {
  type: typeof ProjectActionTypes.CLEAR_PROJECT;
};

type SetEditModeAction = {
  type: typeof ProjectActionTypes.SET_EDIT_MODE;
  payload: boolean;
};

type UpdateProjectAction = {
  type: typeof ProjectActionTypes.UPDATE_PROJECT;
  payload: Project;
};

type GetProjectTimelineAction = {
  type: typeof ProjectActionTypes.GET_PROJECT_TIMELINE;
  payload: ProjectTimelineEvent[];
};

export type ProjectsActions =
  | GetProjectsAction
  | CreateProjectAction
  | SetProjectAction
  | ClearProjectAction
  | SetEditModeAction
  | UpdateProjectAction
  | GetProjectTimelineAction;
