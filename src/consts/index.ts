import { NotificationOpt } from "@/utils/types";

export const CONST_API_MAX_URL_PARAMETER_COUNT = 100;
export const CONST_LEFT_DRAWER_WIDTH = 300;
export const CONST_RIGHT_DRAWER_WIDTH = 200;
export const CONST_STREAM_CHAT_WIDTH = 400;

export const stubElectronNotification: NotificationOpt = {
  options: {
    title: "Muzei",
    subtitle: "Nouvelle notification",
    body: "",
    closeButtonText: "Fermer",
  },
  onClick: "https://www.twitch.tv/",
};
