import { RootState } from 'redux/rootReducer';

export const getRegistrations = (state: RootState) => state.data.registrations.data;
