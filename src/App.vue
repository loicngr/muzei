<template>
  <q-layout view="lHh lpR lF" v-if="isUserConnect">
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
import { dialogConfirm, toast } from "@/utils";
import {
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
      isUserConnect,
      isAppLoading,
      usersOnStreams,
      user,
      userFollows,
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
    async getUser(): Promise<UserData> {
      const users = await fetchUsers();
      return _.get(users, ["data"], [])[0];
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
      const usersOnStreams: UsersOnStreams = await this.fetchUsersDataStreams(
        follows.data
      );
      this.updateUsers(_.keyBy(usersFollows.data, "id"));
      this.updateUsersOnStreams(usersOnStreams);
    },
    async onIpcUserOauthToken(
      evt: IpcRendererEvent,
      userOauthToken: string
    ): Promise<void> {
      await this.$store.dispatch(STORE_USER_LOGIN, userOauthToken);
      if (this.isUserConnect) {
        await this.processAuthUser();
        await this.$router.push({ path: "/home" });
      }
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
