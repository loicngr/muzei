import { createStore, Store, useStore as baseUseStore } from "vuex";
import { State } from "@/utils/types/store";
import {
  UserChannelData,
  UserData,
  UsersFollowsData,
  UsersOnStreams,
} from "@/utils/types/user";
import { InjectionKey } from "vue";
import {
  STORE_FIRST_LAUNCH,
  STORE_LEFT_DRAWER_OPEN,
  STORE_UPDATE_CHANNEL,
  STORE_UPDATE_FOLLOWS,
  STORE_UPDATE_LOADING,
  STORE_UPDATE_USER,
  STORE_UPDATE_USER_OAUTH_TOKEN,
  STORE_UPDATE_USERS,
  STORE_USER_LOGIN,
  STORE_USER_LOGOUT,
  STORE_USER_ON_STREAMS,
} from "@/store/consts";
import { fetchUsers } from "@/utils/api/user";
import { toast } from "@/utils";

export const key: InjectionKey<Store<State>> = Symbol();

export default createStore<State>({
  state: {
    loading: false,
    user: null,
    users: null,
    stream: null,
    streams: [],
    channel: null,
    follows: null,
    leftDrawerOpen: true,
    firstLaunch: true,
  },
  mutations: {
    [STORE_UPDATE_USER_OAUTH_TOKEN](state: State, userOauthToken: string) {
      localStorage.setItem("twitchUserAuthToken", userOauthToken);
    },
    [STORE_USER_ON_STREAMS](state: State, usersOnStreams: UsersOnStreams) {
      state.streams = usersOnStreams;
    },
    [STORE_USER_LOGOUT](state: State) {
      state.user = null;
      localStorage.removeItem("twitchUserAuthToken");
      toast({ color: "positive", message: "Vous êtes déconnecté." });
    },
    [STORE_UPDATE_USER](state: State, userData: UserData) {
      state.user = userData;
    },
    [STORE_UPDATE_USERS](state: State, usersData: Record<string, UserData>) {
      state.users = usersData;
    },
    [STORE_UPDATE_CHANNEL](state: State, userChannelData: UserChannelData) {
      state.channel = userChannelData;
    },
    [STORE_UPDATE_FOLLOWS](state: State, usersFollowsData: UsersFollowsData) {
      state.follows = usersFollowsData;
    },
    [STORE_UPDATE_LOADING](state: State, status: boolean) {
      state.loading = status;
    },
    [STORE_LEFT_DRAWER_OPEN](state: State, status: boolean) {
      state.leftDrawerOpen = status;
    },
    [STORE_FIRST_LAUNCH](state: State, status: boolean) {
      state.firstLaunch = status;
    },
  },
  actions: {
    [STORE_UPDATE_USER_OAUTH_TOKEN](ctx, userOauthToken: string) {
      ctx.commit(STORE_UPDATE_USER_OAUTH_TOKEN, userOauthToken);
    },
    [STORE_USER_LOGOUT](ctx) {
      ctx.commit(STORE_USER_LOGOUT);
    },
    [STORE_USER_ON_STREAMS](ctx, usersOnStreams: UsersOnStreams) {
      ctx.commit(STORE_USER_ON_STREAMS, usersOnStreams);
    },
    [STORE_USER_LOGIN](ctx, userOauthToken: string) {
      ctx.commit(STORE_UPDATE_USER_OAUTH_TOKEN, userOauthToken);
      return new Promise<void>((resolve) => {
        fetchUsers().then((userData) => {
          ctx.commit(STORE_UPDATE_USER, userData);
          toast({ color: "positive", message: "Vous êtes connecté." });
          resolve();
        });
      });
    },
    [STORE_UPDATE_USER](ctx, userData: UserData) {
      ctx.commit(STORE_UPDATE_USER, userData);
    },
    [STORE_UPDATE_USERS](ctx, usersData: Record<string, UserData>) {
      ctx.commit(STORE_UPDATE_USERS, usersData);
    },
    [STORE_UPDATE_CHANNEL](ctx, userChannelData: UserChannelData) {
      ctx.commit(STORE_UPDATE_CHANNEL, userChannelData);
    },
    [STORE_UPDATE_FOLLOWS](ctx, usersFollowsData: UsersFollowsData) {
      ctx.commit(STORE_UPDATE_FOLLOWS, usersFollowsData);
    },
    [STORE_UPDATE_LOADING](ctx, status: boolean) {
      ctx.commit(STORE_UPDATE_LOADING, status);
    },
    [STORE_LEFT_DRAWER_OPEN](ctx, status: boolean) {
      ctx.commit(STORE_LEFT_DRAWER_OPEN, status);
    },
    [STORE_FIRST_LAUNCH](ctx, status: boolean) {
      ctx.commit(STORE_FIRST_LAUNCH, status);
    },
  },
  modules: {},
  getters: {
    loading(state): boolean {
      return state.loading;
    },
    isLeftDrawerOpen(state): boolean {
      return state.leftDrawerOpen;
    },
    userData(state): UserData | null {
      return state.user;
    },
    users(state): Record<string, UserData> | null {
      return state.users;
    },
    userFollowsData(state): UsersFollowsData | null {
      return state.follows;
    },
    channelData(state): UserChannelData | null {
      return state.channel;
    },
    userIsConnected(state): boolean {
      return state.user !== null;
    },
    userOauthToken(): string | null {
      return localStorage.getItem("twitchUserAuthToken") ?? null;
    },
    usersOnStreams(state): UsersOnStreams | [] {
      return state.streams;
    },
    firstLaunch(state): boolean {
      return state.firstLaunch;
    },
  },
});

export function useStore(): Store<State> {
  return baseUseStore(key);
}
