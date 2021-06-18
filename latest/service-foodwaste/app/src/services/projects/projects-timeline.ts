import Project = Projects.Project;
import * as errors from '@feathersjs/errors';
import Moment from 'moment';

const moment = Moment.utc;
const subModule: string = 'projects-timeline';
let requestId: string;
let sessionId: string;
const TYPE_REGISTRATION = 'registration';
const TYPE_ACTION = 'action';
const TYPE_PROJECT = 'project';
const TYPE_PERIOD = 'period';
const ACTIONS = 'actions';

export interface TimelineElement {
  period: number;
  type: 'project' | 'period' | 'action' | 'registration';
  createdAt: string;
  data: any;
}

export interface SplittedProject {
  registrations: TimelineElement[];
  actions: TimelineElement[];
  project: TimelineElement[];
}

export default class ProjectsTimeLine {
  app: any;

  constructor(app: any) {
    this.app = app;
  }

  /**
   * Takes a given project and returns a timeline for it, which consists in a list of events chronologically ordered
   * from most recent
   * to least recent of actions performed to the project
   *
   * @param params
   * @returns {Promise<TimelineElement[]>}
   */
  public async find(params): Promise<TimelineElement[]> {
    const { projectId } = params.route;
    requestId = params.requestId;
    sessionId = params.sessionId;

    let project = null;

    try {
      /*
       * /projects/:projectId/registrations?includeProject=true returns a project with its registrations
       * associated as a single object.
       */
      project = await this.app.service(`projects/:projectId/registrations`).find({
        route: { projectId },
        query: {
          includeProject: true
        }
      });
    } catch (err) {
      if (err.code === 404) {
        throw err;
      }

      throw new errors.GeneralError('Could not retrieve project to build timeline', {
        projectId, errors: err, requestId, sessionId, subModule, errorCode: 'E194'
      });
    }

    /*
     * By default /projects endpoint sets the period of a parent project to the amount of followUp projects
     * it has +1, i.e. A project with 2 follow ups will have period = 3.
     * We need to mark timeline elements such as registrations associated to the parent project with period 1, since
     * they were initially created for period 1, therefore we set project.period to 1 for parent project,
     */
    if (!project.parentProjectId) {
      project.period = 1;
    }

    return this.buildTimeline(project);
  }

  /**
   * Takes a given element (Could be a Project, an Action, a Follow up Project, a Goal) and
   * transform it into a formatted element to display in the timeline
   *
   * @param element
   * @param {'project', 'period', 'action', 'registration', 'goal'} type
   * @param {number} period
   * @returns {TimelineElement}
   */
  public static createTimeLineElement(
    element: any, type: 'project' | 'period' | 'action' | 'registration', period: number): TimelineElement {
    return {
      period,
      type,
      createdAt: ProjectsTimeLine.getElementDate(element, 'date', type) as string,
      data: element
    };
  }

  /**
   * For a given project, builds the timeline, which is an array with different event performed over
   * a project, such as adding registration, actions or follow up projects
   *
   * @param {Projects.Project} project
   * @returns {Promise<TimelineElement[]>}
   */
  public async buildTimeline(project: Project): Promise<TimelineElement[]> {
    let timeline = [];
    try {
      /*
       * We take the project object and separate it into the different components of the timeline
       * project, periods(follow up), actions, registrations anf goals
       */
      const splittedProjectTree: SplittedProject[] = await this.splitProjectTreeIntoTimelineElements(project);
      for (const treeElement of splittedProjectTree) {

        for (const key in treeElement) {
          /*
           * Goals and actions need to be filtered, since they are saved in both, parent and follow up projects
           * but for the timeline, they only make sense in the follow up project
           */
          if (key === ACTIONS) {
            for (const elementToBeAddedToTimeline of treeElement[key]) {
              let index = timeline.findIndex((elementAlreadyInTimeline: TimelineElement) => {
                if (treeElement[key] && treeElement[key][0]) {

                  return elementAlreadyInTimeline.type === elementToBeAddedToTimeline.type
                    && elementAlreadyInTimeline.data.id === elementToBeAddedToTimeline.data.id;
                }

                return false;
              });
              /*
               *  index >=0 means the goal or action was already added to the timeline, so it will be overwritten.
               *  the action/goal associated to the latest project (based on its period) will overwrite the old one.
               *  If there is none in the timeline, it will be added
               */
              if (index >= 0 && timeline[index].period <= treeElement[key][0].period) {
                timeline[index] = elementToBeAddedToTimeline;
              } else if (index === -1) {
                timeline.push(elementToBeAddedToTimeline);
              }
            }
          } else {
            timeline = timeline.concat(treeElement[key]);
          }
        }
      }

      ProjectsTimeLine.sortTimeline(timeline);

      return timeline;

    } catch (err) {
      throw new errors.GeneralError('Could not build projects timeline', {
        projectId: project.id, errors: err, requestId, sessionId, subModule, errorCode: 'E191'
      });
    }
  }

  /**
   * Takes an array of timeline elements and sorts them from recent to oldest based on its 'createdAt' property.
   * We want to organize the array of element in a manner that the latest created ones are at the beginning.
   *
   * So, if element A has been created before B, then it goes after B in the array. If A has been created after B, then
   * it goes before B in the array. If dates are equal, then the elements' places remain unchanged to each other, but
   * still sorted in regards to the rest of the elements.
   *
   * @param {TimelineElement[]} timeline
   * @returns {TimelineElement[]}
   */
  public static sortTimeline(timeline: TimelineElement[]): TimelineElement[] {
    timeline.sort((a: TimelineElement, b: TimelineElement) => {
      const dateA = ProjectsTimeLine.getElementDate(a, 'number') as number;
      const dateB = ProjectsTimeLine.getElementDate(b, 'number') as number;

      if (dateA < dateB) {
        return 1;
      }
      if (dateA > dateB) {
        return -1;
      }
      return 0;
    });

    return timeline;
  }

  /**
   * We regard to "the date" of different elements by different fields. Depending on the element type, take the date
   * value from a different field and convert it to an integer Date, so it can be easily compared.
   *
   * @param {TimelineElement} element
   * @param {string}          dateType  Decides whether the returned date is required as a number (to be used for
   *                                    comparison purposes) or as a date-formatted string
   * @param {string}          type      The type of the element from the list
   * @return {number}
   */
  public static getElementDate(element: TimelineElement, dateType: 'number' | 'date', type?: string): number | string {
    let date: string | number;
    const elementType: string = element.type ? element.type : type;
    const elementData = element.data ? element.data : element;

    switch (elementType) {
      case TYPE_ACTION:
        date = elementData.createdAt;
        break;
      case TYPE_REGISTRATION:
        date = elementData.date;
        break;
      case TYPE_PROJECT:
        date = +elementData.duration.start * 1000;
        break;
      default:
        date = element.createdAt;
    }

    return dateType === 'number' ? moment(date).unix() : moment(date).format('YYYY-MM-DD');
  }

  /**
   * Takes a project and returns the registrations of it formatted to be part of the projects timeline
   *
   * @param {Projects.Project} project
   * @returns {TimelineElement[]}
   */
  public populateRegistrations(project: Project): TimelineElement[] {

    return project.registrations.map(registration =>
      ProjectsTimeLine.createTimeLineElement(registration, TYPE_REGISTRATION, project.period || null)
    );
  }

  /**
   * Takes a project and returns its actions formatted to be part of the project`s timeline
   *
   * @param {Projects.Project} project
   * @returns {Promise<TimelineElement[]>}
   */
  public async populateActions(project: Project): Promise<TimelineElement[]> {
    try {
      const actionIds: number[] | string[] = project.actions.map(projectAction => projectAction.id);
      const actionsFromDb: any[] = await this.app.get('sequelize').models.action.findAll({
        where: {
          id: {
            $in: actionIds
          }
        },
        raw: true
      });

      return actionsFromDb.map(action => ProjectsTimeLine.createTimeLineElement(
        action,
        TYPE_ACTION,
        project.period || null)
      );

    } catch (err) {
      throw new errors.GeneralError('Could not build the actions to add to the projects timeline', {
        projectId: project.id, errors: err, requestId, sessionId, subModule, errorCode: 'E192'
      });
    }
  }

  /**
   * Takes a project and returns an array of items containing the different timeline elements associated to
   * the project and its follow ups. Structure will be something like:
   * [{
   *     registrations: TimelineElement[],
   *     actions: TimelineElement[],
   *     goals: TimelineElement[],
   *     project: TimelineElement[]
   * }]
   *
   *
   * @param {Projects.Project} project
   * @returns {Promise<Array<SplittedProject>>}
   */
  public async splitProjectTreeIntoTimelineElements(project: Project): Promise<SplittedProject[]> {
    try {
      const registrations: TimelineElement[] = this.populateRegistrations(project);
      const actions: TimelineElement[] = await this.populateActions(project);
      const simplifiedProjectObj = Object.assign({}, project);
      delete simplifiedProjectObj['registrations'];
      delete simplifiedProjectObj['followUpProjects'];
      const projectTimelineElement: TimelineElement[] = [
        ProjectsTimeLine.createTimeLineElement(
          simplifiedProjectObj,
          simplifiedProjectObj['parentProjectId'] ? TYPE_PERIOD : TYPE_PROJECT,
          project.period || null
        )
      ];

      const result: SplittedProject[] = [{
        registrations,
        actions,
        project: projectTimelineElement
      }];

      if (project.followUpProjects && project.followUpProjects.length > 0) {
        /*
        * If the project has follow up projects, we recursively call this function, to apply the same
        * logic to the follow ups, then we merge the results, to have the result of both, parents, and follow
        * ups at the same level in the array
        */
        let followUpProjectsResultsPromises = project.followUpProjects.map((followUpProject) => {
          return this.splitProjectTreeIntoTimelineElements(followUpProject);
        });

        const followUpProjectsResults = await Promise.all(followUpProjectsResultsPromises);

        for (const followUpResult of followUpProjectsResults) {
          result.push(followUpResult[0]);
        }
      }

      return result;
    } catch (err) {
      throw new errors.GeneralError('Could not split the project into timeline elements', {
        projectId: project.id, errors: err, requestId, sessionId, subModule, errorCode: 'E193'
      });
    }
  }
}

