import reducer, {
  getProjects,
  initialState,
  Project,
  ProjectActionTypes,
  ProjectStatus
} from './index';
import moment from 'moment';
import { DataTransferMock, MockStore } from 'test-utils';

const dummyProject: Project = {
  followUpProjects: [],
  id: '1',
  name: 'test',
  status: ProjectStatus.isRunning,
  customerId: '1',
  period: 1,
  registrationPoints: [],
  actions: [],
  duration: { start: 1, type: 'REGISTRATIONS' }
};

describe('[REDUX] Tests the projects actions', () => {
  test('GET_PROJECTS', () => {
    const result = reducer(initialState, {
      type: ProjectActionTypes.GET_PROJECTS,
      payload: []
    });

    const expectedState = Object.assign({}, initialState, {
      projects: [],
      projectsLoaded: true
    });

    expect(result).toEqual(expectedState);
  });

  test('CREATE_PROJECT', () => {
    const result = reducer(initialState, {
      type: ProjectActionTypes.CREATE_PROJECT,
      payload: dummyProject
    });

    const expectedState = Object.assign({}, initialState, {
      project: dummyProject
    });

    expect(result).toEqual(expectedState);
  });

  test('SET_PROJECT > set minimum duration start date for a project', () => {
    const durationGenerator = (type: string, daysStart: number, duration: number) => {
      if (type === 'CALENDAR') {
        return {
          start: 1536012000 + daysStart * 86400,
          type: 'CALENDAR',
          end: 1536012000 + (daysStart + duration) * 86400
        };
      } else {
        return {
          start: 1536012000 + daysStart * 86400,
          type: 'REGISTRATIONS',
          days: duration
        };
      }
    };

    const state = Object.assign({}, initialState, {
      projects: [
        {
          id: 1234,
          parentProject: null,
          name: 'Parent project',
          period: 1,
          duration: durationGenerator('CALENDAR', 0, 1),
          activeChild: {
            id: 666
          },
          followUpProjects: [
            {
              id: 1,
              parentProjectId: 1234,
              name: 'Follow-up project 1',
              period: 2,
              duration: durationGenerator('CALENDAR', 1, 3)
            },
            {
              id: 666,
              parentProjectId: 1234,
              name: 'Follow-up project 4',
              period: 5,
              duration: durationGenerator('CALENDAR', 11, 1)
            },
            {
              id: 2,
              parentProjectId: 1234,
              name: 'Follow-up project 2',
              period: 3,
              duration: durationGenerator('REGISTRATIONS', 4, 3)
            },
            {
              id: 3,
              parentProjectId: 1234,
              name: 'Follow-up project 3',
              period: 4,
              duration: durationGenerator('CALENDAR', 10, 1)
            }
          ]
        },
        {
          id: 5,
          parentProjectId: null,
          name: 'Project 1',
          period: 1,
          duration: durationGenerator('CALENDAR', 0, 1),
          followUpProjects: [
            {
              id: 4,
              parentProjectId: 5,
              name: 'Other follow-up project',
              duration: durationGenerator('CALENDAR', 12, 5)
            }
          ]
        }
      ]
    });

    const result = reducer(state, {
      type: ProjectActionTypes.SET_PROJECT,
      payload: {
        ...dummyProject,
        id: 3215,
        parentProjectId: 1234,
        period: 1,
        name: 'Follow-up project 5'
      }
    });

    const date = moment
      .unix(1536012000 + 11 * 86400)
      .utc()
      .endOf('day')
      .toDate();

    expect(moment(result.minDate).utc().toDate()).toEqual(date);
  });

  test('SET_PROJECT > set active child follow up project', () => {
    const expectedUpdateTimestamp = new Date('2020-01-01').getTime();
    jest.spyOn(Date, 'now').mockReturnValueOnce(expectedUpdateTimestamp);
    const project: Project = {
      ...dummyProject,
      id: 1,
      name: 'Test',
      duration: {
        start: 1536012000,
        type: 'CALENDAR',
        end: 1536072000
      },
      followUpProjects: [
        {
          ...dummyProject,
          id: 2,
          name: 'Follow-up project 3',
          period: 3
        },
        {
          ...dummyProject,
          id: 65,
          name: 'Follow-up project wrong',
          period: 4,
          duration: {
            start: 1536082000,
            type: 'CALENDAR',
            end: 1536122000
          }
        },
        {
          ...dummyProject,
          id: 924,
          name: 'Follow-up project 4',
          period: 4,
          duration: {
            start: 1536082000,
            type: 'CALENDAR',
            end: 1536122000
          },
          registrationPoints: []
        },
        {
          ...dummyProject,
          id: 652,
          name: 'Follow-up project wrong',
          period: 4,
          duration: {
            start: 1536082000,
            type: 'CALENDAR',
            end: 1536122000
          }
        },
        {
          ...dummyProject,
          id: 6,
          name: 'Follow-up project 2',
          period: 2
        },
        {
          ...dummyProject,
          id: 3,
          name: 'Follow-up project 1',
          period: 1
        }
      ]
    };

    const result = reducer(initialState, {
      type: ProjectActionTypes.SET_PROJECT,
      payload: project
    });

    const expectedState = {
      ...project,
      activeChild: {
        customerId: '1',
        id: 924,
        name: 'Follow-up project 4',
        period: 4,
        duration: {
          start: 1536082000,
          type: 'CALENDAR',
          end: 1536122000
        },
        registrationPoints: [],
        actions: [],
        status: 'RUNNING',
        followUpProjects: []
      }
    };

    expect(result.projectUpdatedAt).toEqual(expectedUpdateTimestamp / 1000);
    expect(result.project).toEqual(expectedState);
  });
});

describe('projects action-creators', () => {
  const mockTransfer = DataTransferMock(window.sysvars.API_URL);
  let store = MockStore();

  beforeEach(() => {
    store = MockStore();
    mockTransfer.reset();
    localStorage.clear();
  });

  test('getProjects', async () => {
    mockTransfer.onGet('/foodwaste/projects').replyOnce([200, 'success-response']);

    await store.dispatch(getProjects());

    const expectedActions = [
      {
        payload: 'success-response',
        type: ProjectActionTypes.GET_PROJECTS
      }
    ];

    expect(store.getActions()).toEqual(expectedActions);
  });
});
