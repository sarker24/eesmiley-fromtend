import moment from 'moment';
import { Project, ProjectStatus } from 'redux/ducks/projects';

export function projectGetStatus(project: Project): ProjectStatus {
  if (project.followUpProjects && project.followUpProjects.length > 0) {
    const activeChild = project.followUpProjects.filter((project) => {
      return projectIsActive(project);
    });
    return activeChild.length > 0 ? activeChild[0].status : project.status;
  } else {
    return project.status;
  }
}

export function projectIsActive(project: Project): boolean {
  return (
    project.status === ProjectStatus.isRunning ||
    project.status === ProjectStatus.isPendingInput ||
    project.status === ProjectStatus.isPendingFollowUp ||
    project.status === ProjectStatus.isPendingStart
  );
}

export function canAddActionsToProject(project: Project): boolean {
  return (
    project.status === ProjectStatus.isPendingFollowUp ||
    project.status === ProjectStatus.isPendingInput ||
    project.period > 1
  );
}

export function getFilterByProjectStatus(projectStatus: ProjectStatus): ProjectStatus {
  switch (projectStatus) {
    case 'PENDING_START':
    case 'NOT_STARTED':
      return ProjectStatus.isNotStarted;
    case 'IN_PROGRESS':
    case 'PENDING_FOLLOWUP':
    case 'PENDING_INPUT':
    case 'RUNNING':
    case 'RUNNING_FOLLOWUP':
      return ProjectStatus.isInProgress;
    case 'FINISHED':
    case 'ON_HOLD':
      return ProjectStatus.isDone;
  }
}

/**
 * Get latest finished follow-up project of a parent project
 * @param parentProject
 * @return Project | null
 */
export function getLatestFinishedFollowUpProject(parentProject: Project): Project {
  if (!parentProject.followUpProjects) {
    return null;
  }

  let period = 0;
  let activeChild: Project = null;

  parentProject.followUpProjects.map((followUpProject: Project, index: number) => {
    if (followUpProject.period > period && followUpProject.status === ProjectStatus.isFinished) {
      activeChild = parentProject.followUpProjects[index];
      period = followUpProject.period;
    }
  });

  return activeChild;
}

function compareFollowUpProjectsHelper(
  followUpProject: Project,
  period: number,
  prevFollowUpProjectId?: number | null
): boolean {
  return (
    followUpProject.period &&
    (period < followUpProject.period ||
      (period == followUpProject.period &&
        prevFollowUpProjectId &&
        prevFollowUpProjectId < followUpProject.id))
  );
}

/**
 * Set the active child follow-up project for a parent project, if any available, and return the parent project
 */
export function setActiveChildFollowUpProject(parentProject: Project): Project {
  let activeChild: Project = null;
  if (parentProject.followUpProjects && parentProject.followUpProjects.length > 0) {
    let period = 0;

    // Walk through the follow up projects to get the latest one.
    // If there for any reason would be two follow up projects with the same period, we will compare with the id of the follow up projects
    parentProject.followUpProjects.map((followUpProject: Project) => {
      if (
        compareFollowUpProjectsHelper(
          followUpProject,
          period,
          activeChild ? (activeChild.id as number) : null
        )
      ) {
        activeChild = followUpProject;
        period = activeChild.period;
      }
    });

    if (activeChild != null) {
      parentProject.activeChild = activeChild;
    }
  }

  return parentProject;
}

/**
 * Calculate the minimum duration start date for a project and return the date
 * @param parentProject
 * @returns {Date}
 */
export function calculateMinimumDurationStartDate(parentProject: Project): Date | null {
  if (!parentProject.followUpProjects || parentProject.followUpProjects.length == 0) {
    return null;
  }

  let period = 0;
  let latestFollowUpProject: Project = null;

  // Walk through the follow up projects to get the latest one before the newest follow up project.
  // If there for any reason would be two follow up projects with the same period, we will compare with the id of the follow up projects
  parentProject.followUpProjects.map((followUpProject: Project) => {
    if (
      compareFollowUpProjectsHelper(
        followUpProject,
        period,
        latestFollowUpProject ? (latestFollowUpProject.id as number) : null
      ) &&
      followUpProject.id != parentProject.id &&
      (!parentProject.activeChild || parentProject.activeChild.id != followUpProject.id)
    ) {
      latestFollowUpProject = followUpProject;
      period = followUpProject.period;
    }
  });

  if (latestFollowUpProject != null && latestFollowUpProject.duration) {
    // If  the duration.end is not defined, use duration.start
    return moment
      .unix(
        latestFollowUpProject.duration.end != null
          ? latestFollowUpProject.duration.end
          : latestFollowUpProject.duration.start
      )
      .utc()
      .endOf('day')
      .toDate();
  }

  // If  the duration.end is not defined, use duration.start
  const timestamp: number =
    parentProject.duration.end != null ? parentProject.duration.end : parentProject.duration.start;
  return timestamp ? moment.unix(timestamp).utc().endOf('day').toDate() : null;
}
