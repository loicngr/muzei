<template>
  <q-layout v-if="isUserConnect" view="lHh lpR lF">
    <q-page-container class="bg-dark-01">
      <router-view />
    </q-page-container>
  </q-layout>
  <q-layout v-else-if="!isUserConnect">
    <q-page-container class="bg-dark-01">
      <Landing />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import eventsHandler from "@/mixins/eventsHandler";
import Landing from "@/views/Landing.vue";
import {
  CONST_API_MAX_URL_PARAMETER_COUNT,
  CONST_LEFT_DRAWER_WIDTH,
  CONST_RIGHT_DRAWER_WIDTH,
} from "@/consts";
import { dialogConfirm, launchElectronNotification, toast } from "@/utils";
import {
  STORE_FIRST_LAUNCH,
  STORE_UPDATE_CHANNEL,
  STORE_UPDATE_FOLLOWS,
  STORE_UPDATE_LOADING,
  STORE_UPDATE_USER,
  STORE_UPDATE_USERS,
  STORE_USER_LOGIN,
  STORE_USER_LOGOUT,
  STORE_USER_ON_STREAMS,
} from "@/store/consts";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { IPC_OPEN_EXTERNAL, IPC_USER_OAUTH_TOKEN } from "@/utils/event";
import {
  UserChannelData,
  UserData,
  UserFollowsData,
  UsersData,
  UsersFollowsData,
  UsersOnStreams,
  UserStreamsData,
} from "@/utils/types/user";
import _ from "lodash";
import {
  fetchUserChannel,
  fetchUserFollows,
  fetchUsers,
  fetchUserStreams,
} from "@/utils/api/user";
import {
  APP_LOADING,
  APP_TOGGLE_RIGHT_DRAWER,
  EventAppLoading,
  EventUserFollows,
  FETCH_USER,
  FETCH_USER_CHANNEL,
  FETCH_USER_FOLLOWS,
} from "@/utils/types/events";
import {
  fetchPaginationData,
  OAUTH_ENDPOINT,
  PaginationDataTotal,
  USERS_FOLLOWS_ENDPOINT,
} from "@/utils/api";
import { Loading } from "quasar";
import { useStore } from "@/store";

type dataRightMenuType = {
  icon: string;
  label: string;
  action: CallableFunction;
  separator?: boolean;
};

export default defineComponent({
  name: "App",
  mixins: [eventsHandler],
  components: {
    Landing,
  },
  CONST_LEFT_DRAWER_WIDTH,
  CONST_RIGHT_DRAWER_WIDTH,
  data() {
    return {
      rightDrawerOpen: false as boolean,
      rightDrawerMenuList: [
        {
          icon: "logout",
          label: "Déconnexion",
          action: async () => {
            const modal = await dialogConfirm({
              message: "Êtes-vous sur de vouloir vous déconnecter ?",
            });
            modal.onOk(() => this.$store.dispatch(STORE_USER_LOGOUT));
          },
          separator: true,
        },
        {
          icon: "help",
          iconColor: "primary",
          label: "Aide",
          action: () => {
            ipcRenderer.send(
              IPC_OPEN_EXTERNAL,
              "https://github.com/loicngr/muzei/issues"
            );
          },
          separator: true,
        },
        {
          icon: "home",
          iconColor: "primary",
          label: "Accueil",
          action: () => {
            this.$router.push({ path: "/home" });
          },
          separator: false,
        },
      ] as dataRightMenuType[],
      tickrateFetchFollows: 60000,
      tickrateMouseIsMoved: 5000,
      mouseIsMoved: false,
      mouseIsMovedTimeout: -1,
      eventsHandler: {
        autoInit: true,
        autoDestroy: true,
        events: [],
      },
    };
  },
  setup() {
    const store = useStore();

    // Computed
    const isUserConnect = computed<boolean>(() => {
      return store.getters["userIsConnected"];
    });
    const isFirstLaunch = computed<boolean>(() => {
      return store.getters["firstLaunch"];
    });
    const isAppLoading = computed<boolean>(() => {
      return store.getters["loading"];
    });
    const usersOnStreams = computed<UserStreamsData[]>(() => {
      const _users = _.get(store.getters["usersOnStreams"], "data", []);
      return _.sortBy(_users, "viewer_count").reverse();
    });
    const user = computed<UserData>(() => {
      return store.getters["userData"];
    });
    const userFollows = computed<UsersFollowsData>(() => {
      return store.getters["userFollowsData"];
    });

    return {
      usersOnStreams,
      isFirstLaunch,
      isUserConnect,
      isAppLoading,
      userFollows,
      user,
    };
  },
  async created() {
    // Init event listener
    ipcRenderer.on(IPC_USER_OAUTH_TOKEN, this.onIpcUserOauthToken);
    this.$emitter.on(APP_LOADING, (e: EventAppLoading) => {
      if (!e.status) e.status = !this.isAppLoading;
      this.eventAppLoading(e);
    });
    this.$emitter.on(FETCH_USER, this.eventFetchUser);
    this.$emitter.on(FETCH_USER_CHANNEL, this.eventFetchUserChannel);
    this.$emitter.on(FETCH_USER_FOLLOWS, (e: EventUserFollows) => {
      this.eventFetchUserFollows(e);
    });
    this.$emitter.on(APP_TOGGLE_RIGHT_DRAWER, this.toggleRightDrawer);

    if (
      (!this.$store.getters["userOauthToken"] &&
        this.$store.getters["userData"]) ||
      (this.$store.getters["userOauthToken"] &&
        !this.$store.getters["userData"])
    ) {
      await this.processAuthUser();
    }

    if (this.isUserConnect) {
      await this.$router.push({ name: "Home" });
    } else if (!this.isUserConnect && this.$route.meta.requiresLogin) {
      await this.$router.push({ name: "Main" });
    }
  },
  mounted() {
    this.autoFetchFollows();
  },
  beforeUnmount() {
    // Remove event listener
    ipcRenderer.off(IPC_USER_OAUTH_TOKEN, this.onIpcUserOauthToken);
    this.$emitter.off(APP_LOADING);
    this.$emitter.off(FETCH_USER);
    this.$emitter.off(FETCH_USER_CHANNEL);
    this.$emitter.off(FETCH_USER_FOLLOWS);
    this.$emitter.off(APP_TOGGLE_RIGHT_DRAWER);
  },
  methods: {
    async processAuthUser(): Promise<void> {
      // Set app in loading state
      const stateLoading: EventAppLoading = { status: true };
      await this.eventAppLoading(stateLoading);

      await this.eventFetchUser();
      await this.eventFetchUserChannel();
      if (this.user) {
        await this.eventFetchUserFollows({
          from_id: this.user.id.toString(),
        });
      } else {
        toast({
          color: "negative",
          message: "Impossible de récupérer les follows",
        });
      }

      // Set app in no loading state
      stateLoading.status = false;
      await this.eventAppLoading(stateLoading);
    },
    toggleRightDrawer(): void {
      this.rightDrawerOpen = !this.rightDrawerOpen;
    },
    updateUser(userData: UserData): void {
      this.$store.dispatch(STORE_UPDATE_USER, userData);
    },
    updateUserChannel(userChannelData: UserChannelData): void {
      this.$store.dispatch(STORE_UPDATE_CHANNEL, userChannelData);
    },
    updateUserFollows(usersFollowsData: UsersFollowsData): void {
      this.$store.dispatch(STORE_UPDATE_FOLLOWS, usersFollowsData);
    },
    updateUsersOnStreams(usersOnStreams: UsersOnStreams): void {
      this.$store.dispatch(STORE_USER_ON_STREAMS, usersOnStreams);
    },
    updateUsers(users: Record<string, unknown>): void {
      this.$store.dispatch(STORE_UPDATE_USERS, users);
    },
    updateFirstLaunch(status: boolean): void {
      this.$store.dispatch(STORE_FIRST_LAUNCH, status);
    },
    async getUser(): Promise<undefined | UserData> {
      try {
        const users = await fetchUsers();
        return _.get(users, ["data"], [])[0];
      } catch (exception) {
        console.error(exception);
        const oauthEndpoint: string = OAUTH_ENDPOINT();
        ipcRenderer.send(IPC_OPEN_EXTERNAL, oauthEndpoint);
        return;
      }
    },
    async getUserChannel(): Promise<UserChannelData> {
      return fetchUserChannel();
    },
    async eventAppLoading(state: EventAppLoading): Promise<void> {
      if (state.status) {
        Loading.show({
          message: "Chargement ...",
        });
      } else {
        Loading.hide();
      }

      await this.$store.dispatch(STORE_UPDATE_LOADING, state.status);
    },
    async eventFetchUser(): Promise<void> {
      const userData = await this.getUser();
      if (!userData) return;

      this.updateUser(userData);
    },
    async eventFetchUserChannel(): Promise<void> {
      const userChannelData = await this.getUserChannel();
      this.updateUserChannel(userChannelData);
    },
    async fetchUsersData(users: UserFollowsData[]) {
      let _listUserId = [];
      let _count = 0;
      const _usersData: any[] | UserData[] = [];
      const _users = {
        data: _usersData,
      };
      for await (const _data of users) {
        if (_count === CONST_API_MAX_URL_PARAMETER_COUNT) {
          const _usersFetched: UsersData = await fetchUsers(
            undefined,
            undefined,
            _listUserId
          );
          _usersFetched.data.forEach((_i) => _users.data.push(_i));
          _count = 0;
          _listUserId = [];
        }
        _listUserId.push(parseInt(_data.to_id));
        _count++;
      }
      _users.data = _users.data.flat(Infinity);
      return _users;
    },
    async fetchUsersDataStreams(
      users: UserFollowsData[]
    ): Promise<UsersOnStreams> {
      let _listUserId = [];
      let _count = 0;
      const _usersOnStreamsData: any[] | UserStreamsData[] = [];
      const _usersOnStreams = {
        data: _usersOnStreamsData,
      };
      for await (const _data of users) {
        if (_count === CONST_API_MAX_URL_PARAMETER_COUNT) {
          const _streams = await fetchUserStreams(undefined, _listUserId);
          _streams.data.forEach((_i) => _usersOnStreams.data.push(_i));
          _count = 0;
          _listUserId = [];
        }
        _listUserId.push(parseInt(_data.to_id));
        _count++;
      }
      _usersOnStreams.data = _usersOnStreams.data.flat(Infinity);
      return _usersOnStreams;
    },
    async eventFetchUserFollows(params: EventUserFollows) {
      const baseUserFollows = await fetchUserFollows(params);
      const userFollowsParams: PaginationDataTotal<UserFollowsData> = {
        pagination: baseUserFollows.pagination,
        data: baseUserFollows.data,
        total: baseUserFollows.total,
        endpoint: USERS_FOLLOWS_ENDPOINT(),
        endpointOpts: "?from_id=" + this.user.id + "&first=100",
      };
      const follows = await fetchPaginationData(userFollowsParams);
      const usersFollows = await this.fetchUsersData(follows.data);
      this.updateUserFollows({
        data: follows.data,
        pagination: follows.pagination,
        total: follows.total,
      });
      let usersOnStreams: UsersOnStreams = await this.fetchUsersDataStreams(
        follows.data
      );

      const isFirstLaunch = this.isFirstLaunch;
      if (isFirstLaunch) {
        usersOnStreams.data.forEach((user) => {
          user.notified = true;
        });
        this.updateFirstLaunch(false);
      } else {
        const oldUsersOnStreams = _.keyBy(this.usersOnStreams, "user_id");
        usersOnStreams.data.forEach((user) => {
          if (oldUsersOnStreams[user.user_id]) {
            user.notified = oldUsersOnStreams[user.user_id].notified || false;
          } else {
            user.notified = false;
          }
        });
      }

      this.updateUsers(_.keyBy(usersFollows.data, "id"));
      this.updateUsersOnStreams(usersOnStreams);
      // if (isFirstLaunch) {
      //   usersOnStreams = this.addTestUserFollowOnStream();
      // }
      this.notifyNewUserOnStreams(usersOnStreams);
    },
    notifyNewUserOnStreams(usersOnStreams: UsersOnStreams): void {
      let needUpdate = false;

      usersOnStreams.data.forEach((userData) => {
        if (!userData.notified) {
          launchElectronNotification(
            userData.user_login,
            `${userData.user_name} - ${userData.title}`
          );
          userData.notified = true;
          needUpdate = true;
        }
      });

      if (needUpdate) {
        this.updateUsersOnStreams(usersOnStreams);
      }
    },
    // addTestUserFollowOnStream(): UsersOnStreams {
    //   const fakeUser = {
    //     id: "1",
    //     user_id: "1",
    //     user_login: "user_login",
    //     user_name: "user_name",
    //     game_id: "509658",
    //     game_name: "Just Chatting",
    //     type: "live",
    //     title: "titre",
    //     viewer_count: 6666,
    //     started_at: "2021-08-24T16:50:23Z",
    //     language: "fr",
    //     thumbnail_url: "",
    //     tag_ids: [],
    //     is_mature: false,
    //     notified: false,
    //   } as UserStreamsData;
    //   const usersOnStreams: UsersOnStreams = { data: this.usersOnStreams };
    //   usersOnStreams.data.push(fakeUser);
    //   this.updateUsersOnStreams(usersOnStreams);
    //   return usersOnStreams;
    // },
    async onIpcUserOauthToken(
      evt: undefined | IpcRendererEvent,
      userOauthToken: string
    ): Promise<boolean> {
      await this.$store.dispatch(STORE_USER_LOGIN, userOauthToken);
      if (this.isUserConnect) {
        await this.processAuthUser();
        await this.$router.push({ path: "/home" });
        return true;
      }
      return false;
    },
    async autoFetchFollows() {
      if (this.user) {
        await this.eventFetchUserFollows({
          from_id: this.user.id.toString(),
        });
      }
      setTimeout(this.autoFetchFollows.bind(this), this.tickrateFetchFollows);
    },
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #a0a8ae;
}
</style>
