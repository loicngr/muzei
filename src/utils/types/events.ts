export const USER_LOGGED_IN = Symbol("userLoggedIn");
export const FETCH_USER = Symbol("fetchUsers");
export const FETCH_USER_CHANNEL = Symbol("fetchUserChannel");
export const FETCH_USER_FOLLOWS = Symbol("fetchUserFollows");
export const APP_LOADING = Symbol("appLoading");
export const APP_TOGGLE_LEFT_DRAWER = Symbol("appToggleLeftDrawer");
export const APP_TOGGLE_RIGHT_DRAWER = Symbol("appToggleRightDrawer");

export type EventAppLoading = {
  status?: boolean;
};

export type EventUserFollows = {
  from_id?: string;
  to_id?: string;
  first?: number;
};

export type Events = {
  [USER_LOGGED_IN]: boolean;
  [FETCH_USER]: unknown;
  [FETCH_USER_CHANNEL]: unknown;
  [FETCH_USER_FOLLOWS]: EventUserFollows;
  [APP_LOADING]: EventAppLoading;
  [APP_TOGGLE_LEFT_DRAWER]: unknown;
  [APP_TOGGLE_RIGHT_DRAWER]: unknown;
};
