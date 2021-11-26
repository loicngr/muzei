import store from "@/store";
import {
  UserData,
  UserFollowsData,
  UsersFollowsData,
} from "@/utils/types/user";
import _ from "lodash";
import { Dialog, Notify } from "quasar";
import { NotificationOpt } from "@/utils/types";
import { ipcRenderer } from "electron";
import { IPC_LAUNCH_NOTIFICATION } from "@/utils/event";
import { stubElectronNotification } from "@/consts";

export const getUserData = (userId: string): UserFollowsData | undefined => {
  const follows: UsersFollowsData | null = store.getters["userFollowsData"];
  if (!follows) return undefined;

  for (const user of follows.data) {
    if (user.to_id == userId) return user;
  }
};

export const parseThumbnail = (link: string): string => {
  link = _.replace(link, new RegExp("{width}"), "20");
  link = _.replace(link, new RegExp("{height}"), "20");
  return link;
};

export const getUserProfilePic = (uid: string): null | string => {
  const user = getUserById(uid);
  if (!user) return null;

  return user.profile_image_url;
};

export const getUserById = (uid: string): null | UserData => {
  return store.getters["users"][uid];
};

export const nFormatter = (num: number, digits: number): string => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
};

export const numberHumanReadable = (nbr: number): string => {
  return nFormatter(nbr, 1);
};

export const dialogConfirm = (opt: Record<string, unknown>) => {
  return Dialog.create({
    persistent: true,
    cancel: true,
    title: "Confirmation",
    ...opt,
  });
};

export const CONFIRM_REJECT_CANCEL = new Error("cancel");
export const CONFIRM_REJECT_DISMISS = new Error("dismiss");
export const promiseConfirm = (
  opt: Record<string, unknown>
): Promise<unknown> =>
  new Promise((resolve, reject) => {
    dialogConfirm(opt)
      .onOk(resolve)
      .onCancel(() => reject(CONFIRM_REJECT_CANCEL))
      .onDismiss(() => reject(CONFIRM_REJECT_DISMISS));
  });

export const tryCatchConfirm = async (
  f: CallableFunction
): Promise<unknown> => {
  try {
    return await f();
  } catch (e) {
    if ([CONFIRM_REJECT_CANCEL, CONFIRM_REJECT_DISMISS].indexOf(e) === -1) {
      return Promise.reject(e);
    }
  }
};

export const toast = (opt: Record<string, unknown>) => {
  return Notify.create({
    ...opt,
  });
};

export const determineHeight = (width: number): number => {
  return width / 1.8;
};

export const gcd = (a: number, b: number): number => {
  return b ? gcd(b, a % b) : a;
};

export const aspectRatio = (width: number, height: number): string => {
  const divisor = gcd(width, height);

  return `${width / divisor}:${height / divisor}`;
};

export const buildTwitchChannelLink = (userLogin: string): string => {
  return "https://www.twitch.tv/" + userLogin;
};

export const launchElectronNotification = (
  username: string,
  body?: string
): void => {
  const notificationOpt: NotificationOpt = { ...stubElectronNotification };
  if (body) notificationOpt.options.body = body;
  notificationOpt.onClick += username;
  ipcRenderer.send(IPC_LAUNCH_NOTIFICATION, { ...notificationOpt });
};
