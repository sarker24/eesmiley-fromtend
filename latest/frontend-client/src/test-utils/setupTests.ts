import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
configure({ adapter: new Adapter() });

process.on('unhandledRejection', (reason) => {
  console.error(reason);
  process.exit(1);
});
