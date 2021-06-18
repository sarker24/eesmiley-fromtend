import moment from 'moment';
import { Hook, HookContext } from '@feathersjs/feathers';
import * as errors from '@feathersjs/errors';

const DateFormat = 'YYYY-MM-DD';
const subModule = 'parse-date-params';

interface DateRange {
  from: string;
  to: string;
}

export default (): Hook => {
  return async (hook: HookContext): Promise<HookContext> => {
    const { from, to } = hook.params.query;
    const { requestId, sessionId } = hook.params;

    if (from && to && moment(from).isAfter(moment(to))) {
      throw new errors.Unprocessable('Invalid range: start date cannot be after end date', {
        subModule,
        from,
        to,
        requestId,
        sessionId
      });
    }

    const range = parseRange(from, to);

    delete hook.params.query.from;
    delete hook.params.query.to;

    hook.params.query = {
      ...hook.params.query,
      date: {
        $gte: range.from,
        $lte: range.to
      }
    };

    return hook;
  };
};

function parseRange(from ?: string, to ?: string): DateRange {

  const now = moment();

  if (!from && !to) {
    return {
      from: now.clone().subtract(1, 'year').format(DateFormat),
      to: now.format(DateFormat)
    };
  }

  return {
    from: from || moment(to).subtract(1, 'year').format(DateFormat),
    to: to || moment(from).add(1, 'year').format(DateFormat)
  };

}
