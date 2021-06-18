import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { avg, groupBy, max, min, sum } from '../../../util/array';
import { round } from '../../../util/math';
import { Aggregates, Series } from '../../../declarations/reports';
import moment from 'moment';
import { REGISTRATION_DATE_FORMAT } from '../../../util/datetime';

interface CustomerRegistrationCountPerDay {
  date: string;
  customerId: string;
  count: string;
}

interface RegistrationCount {
  date: string;
  total: number;
}

interface FrequencyAverageReport {
  series: Series[];
}

class RegistrationReportService implements SetupMethod, Pick<ServiceMethods<any>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<FrequencyAverageReport> {
    const { customerId, date } = params.query;

    const queryOptions = {
      attributes: ['customerId', 'date', [this.sequelize.fn('count', '*'), 'count']],
      group: ['customerId', 'date']
    };

    const registrationsByCustomerAndDate: CustomerRegistrationCountPerDay[] = await this.sequelize.models.registration.findAll({
      raw: true,
      attributes: queryOptions.attributes,
      group: queryOptions.group,
      where: {
        customerId,
        date
      }
    });

    const registrationsByDate: { [index: string]: CustomerRegistrationCountPerDay[] } = groupBy(registrationsByCustomerAndDate, 'date');

    const startDay = moment(date.$gte);
    const numOfDays = moment(date.$lte).diff(startDay, 'days') + 1;

    const dateRange: string[] = [];
    for(let i = 0; i < numOfDays; ++i, startDay.add(1, 'day')) {
      const date = startDay.format(REGISTRATION_DATE_FORMAT);
      dateRange.push(date);
    }

    const totalRegistrationPerDay: RegistrationCount[] = dateRange.map(date => {
      const registrations = registrationsByDate[date];
      const average: number = registrations ? sum(registrations.map(({ count }) => parseInt(count))) : 0;
      return { date, total: average };
    });

    // only non-zero actual values for aggregates
    const values: number[] = totalRegistrationPerDay.map(item => item.total).filter(value => value > 0);

    const aggregates: Aggregates = {
      min: values.length > 0 ? min(values): 0,
      max: values.length > 0 ? max(values): 0,
      avg: values.length > 0 ? round(avg(values), 2) : 0,
      total: values.length > 0 ? sum(values) : 0
    };

    const series = [{
      id: 'frequencyAveragePerDay',
      unit: 'scalar',
      aggregates,
      points: totalRegistrationPerDay.map(item => ({
        label: item.date,
        value: item.total
      }))
    }];

    return { series };
  }
}

export default RegistrationReportService;
