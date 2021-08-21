import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store, { key } from "./store";
import axiosInstance from "@/lib/axiosInstance";
import lodash from "@/lib/lodash";
import { emitter } from "@/lib/emitter";
import { Emitter } from "mitt";
import { Events as MittEvents } from "@/utils/types/events";
import { Quasar } from "quasar";
import { quasarUserOptions } from "@/quasar-user-options";

export const TWITCH_CLIENT_ID: string =
  process.env.VUE_APP_TWITCH_CLIENT_ID ?? "";
export const TWITCH_CLIENT_SECRET: string =
  process.env.VUE_APP_TWITCH_CLIENT_SECRET ?? "";
export const TWITCH_REDIRECT_URL: string =
  process.env.VUE_APP_TWITCH_REDIRECT_URL ?? "";
export const TWITCH_BASE_URL: string =
  process.env.VUE_APP_TWITCH_BASE_URL ?? "";
export const TWITCH_OAUTH_BASE_URL = "https://id.twitch.tv/oauth2/authorize";
export const TWITCH_SCOPES: string = process.env.VUE_APP_TWITCH_SCOPES ?? "";

const app = createApp(App);

app.config.globalProperties.$twitchClientId = TWITCH_CLIENT_ID;
app.config.globalProperties.$twitchRedirectUrl = TWITCH_REDIRECT_URL;
app.config.globalProperties.$twitchBaseUrl = TWITCH_BASE_URL;
app.config.globalProperties.$http = axiosInstance;
app.config.globalProperties.$_ = lodash;
app.config.globalProperties._ = lodash;
app.config.globalProperties.$emitter = emitter;
app.config.globalProperties.isDev = process.env.NODE_ENV === "development";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $twitchClientId: typeof app.config.globalProperties.$twitchClientId;
    $twitchBaseUrl: typeof app.config.globalProperties.$twitchBaseUrl;
    $twitchRedirectUrl: typeof app.config.globalProperties.$twitchRedirectUrl;
    $http: typeof axiosInstance;
    $_: typeof lodash;
    _: typeof lodash;
    $store: typeof store;
    $emitter: Emitter<MittEvents>;
    isDev: typeof app.config.globalProperties.isDev;
  }
}

app.use(store, key);
app.use(router);
app.use(Quasar, quasarUserOptions);
app.mount("#app");
