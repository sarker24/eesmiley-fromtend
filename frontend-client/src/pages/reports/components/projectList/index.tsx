import * as React from 'react';
import { connect } from 'react-redux';
import {
  projectsWithAccountsAndProductStringSelector,
  searchProjectsSelector
} from 'redux/ducks/reports/selectors';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search';
import Sorter from './components/sorter';
import ArrowIcon from 'material-ui/svg-icons/navigation/chevron-right';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@material-ui/core';
import { Project } from 'redux/ducks/projects';

require('./index.scss');

interface StateProps {
  projects: any;
  value: any;
  hasSelectedMultipleAccounts: boolean;
}

interface DispatchProps {
  selectProject: (project: any) => void;
}

export interface OwnProps {
  selectProjectId: any; // value ?
}

export interface IComponentState {
  searchFilter: string;
  sorting: {
    key: string;
    ascending: boolean;
  };
}

const sort = (data: {}[], func: Function, ascending: boolean) => {
  if (ascending) {
    data.sort((item, item2) => {
      return func(item) < func(item2) ? 1 : -1;
    });
  } else {
    data.sort((item, item2) => {
      return func(item) > func(item2) ? 1 : -1;
    });
  }
};

type ProjectListProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class ProjectList extends React.Component<ProjectListProps, IComponentState> {
  constructor(props: ProjectListProps) {
    super(props);
    this.createProjectElement = this.createProjectElement.bind(this);

    this.state = {
      searchFilter: '',
      sorting: {
        key: 'name',
        ascending: false
      }
    };
  }

  createProjectElement(project: Project & { secondaryText?: string; productString: string }) {
    const { selectProject, value, hasSelectedMultipleAccounts } = this.props;
    return (
      <TableRow
        key={project.id}
        className={`project ${
          value !== undefined && (project.id == value || project.parentProjectId == value)
            ? 'activeProject'
            : ''
        }`}
      >
        <TableCell
          onClick={() => {
            selectProject(project);
          }}
        >
          <h3>{project.name}</h3>
          {hasSelectedMultipleAccounts && window.innerWidth <= 480 && (
            <span className='accountText'>{project.secondaryText}</span>
          )}
        </TableCell>
        {hasSelectedMultipleAccounts && window.innerWidth > 480 && (
          <TableCell
            onClick={() => {
              selectProject(project);
            }}
          >
            <span className='accountText'>{project.secondaryText}</span>
          </TableCell>
        )}
        <TableCell
          onClick={() => {
            selectProject(project);
          }}
          style={{ textAlign: 'right' }}
        >
          <ArrowIcon style={{ fill: 'rgb(0, 150, 136)' }} />
        </TableCell>
      </TableRow>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextState.sorting.key != this.state.sorting.key ||
      nextProps.value != this.props.value ||
      nextState.sorting.ascending != this.state.sorting.ascending ||
      nextState.searchFilter != this.state.searchFilter ||
      JSON.stringify(nextProps.projects) != JSON.stringify(this.props.projects)
    ) {
      return true;
    }

    return false;
  }

  renderList() {
    const { intl, projects, hasSelectedMultipleAccounts } = this.props;

    if (projects.data.length == 0) {
      return (
        <div
          className='projectList noResults'
          style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'center'
          }}
        >
          <span>{intl.messages['report.projects.no_data.description']}</span>
        </div>
      );
    }
    const projectsFiltered = searchProjectsSelector({
      projects: projects.data,
      searchFilter: this.state.searchFilter
    });

    switch (this.state.sorting.key) {
      case 'name':
        sort(
          projectsFiltered,
          (project) => project.name.toLowerCase(),
          this.state.sorting.ascending
        );
        break;
      case 'startDate':
        sort(projectsFiltered, (project) => project.duration.start, this.state.sorting.ascending);
        break;
      case 'totalAmount':
      case 'totalCost':
      case 'status':
      case 'period':
        sort(
          projectsFiltered,
          (project) => project[this.state.sorting.key],
          this.state.sorting.ascending
        );
        break;
    }

    if (projectsFiltered.length == 0) {
      return (
        <div
          className='projectList noResults'
          style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'center'
          }}
        >
          <span>{intl.messages['report.projects.no_data.description']}</span>
        </div>
      );
    }

    return (
      <div className='projectList'>
        <Table className='projectListTable'>
          <TableHead>
            <TableRow>
              <TableCell colSpan={hasSelectedMultipleAccounts && window.innerWidth > 480 ? 1 : 2}>
                {intl.messages['settings.content.table.name']}
              </TableCell>
              {hasSelectedMultipleAccounts && window.innerWidth > 480 && (
                <TableCell colSpan={2}>{intl.messages['account']}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody className='projectListBody'>
            {projectsFiltered.map((project: any) => this.createProjectElement(project))}
          </TableBody>
        </Table>
      </div>
    );
  }

  render() {
    const { intl, projects } = this.props;
    const { searchFilter, sorting } = this.state;

    return (
      <div className={'projectsBlock'}>
        <div className='searchBar'>
          <div style={{ position: 'relative', flex: '1', display: 'block' }}>
            <SearchIcon
              className={'icon'}
              style={{ position: 'absolute', left: 0, bottom: 12, width: 24, height: 24 }}
            />
            <TextField
              disabled={projects.data.length == 0}
              floatingLabelText={intl.messages['search']}
              onChange={(event, value) => {
                this.setState({
                  searchFilter: value
                });
              }}
              fullWidth={true}
              value={searchFilter}
              floatingLabelStyle={{ marginLeft: '33px' }}
              floatingLabelFocusStyle={{ marginLeft: '2px' }}
              inputStyle={{ marginLeft: '33px' }}
              className='searchField'
            />
          </div>
          <Sorter
            value={sorting}
            onChange={(sorting) => {
              this.setState({ sorting });
            }}
          />
        </div>
        {this.renderList()}
        <div className='projectListShadow'></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  projects: {
    ...state.reports.projects,
    data: projectsWithAccountsAndProductStringSelector(state)
  },
  value: state.reports.filter.id,
  hasSelectedMultipleAccounts:
    state.reports.filter.accounts && state.reports.filter.accounts.length > 1
});

const mapDispatchToProps = (dispatch) => ({
  selectProject: (project: { id: string; customerId: string }) =>
    dispatch({
      type: 'esmiley/reports/SET_FILTER',
      payload: {
        account: project.customerId,
        id: project.id
      }
    })
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ProjectList));
