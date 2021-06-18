export enum UserActionTypes {
  USER_LOADED = 'esmiley/user/USER_LOADED',
  SET_CLIENT = 'esmiley/user/SET_CLIENT'
}
type LoadUserAction = {
  type: typeof UserActionTypes.USER_LOADED;
  payload: UserProfile;
};

type SetClientAction = {
  type: typeof UserActionTypes.SET_CLIENT;
  payload: string;
};

// not sure which of these should be optional
export interface UserProfile {
  customerId?: number;
  customerName?: string;
  email?: string;
  id?: number;
  locale?: string;
  name?: string;
  nickname?: string;
  phone?: string;
  username?: string;
}

export interface UserState extends Partial<UserProfile> {
  client?: string;
}

export type UserActions = LoadUserAction | SetClientAction;
