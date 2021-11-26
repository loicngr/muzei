"use strict";

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Notification,
  protocol,
  session,
  shell,
  Tray,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import {
  IPC_LAUNCH_NOTIFICATION,
  IPC_OPEN_EXTERNAL,
  IPC_USER_OAUTH_TOKEN,
} from "@/utils/event";
import { NotificationOpt } from "@/utils/types";

declare const __static: string;
let win: BrowserWindow;
let tray: Tray;
const isDevelopment = process.env.NODE_ENV !== "production";
const app_scheme = "app-muzei";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 300,
    height: 450,
    resizable: false,
    webPreferences: {
      webSecurity: false,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  if (process.env.NODE_ENV === "production") {
    // win.removeMenu();
  }

  tray = new Tray(path.join(__static, "/favicon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Menu",
      submenu: [
        {
          label: "Minimiser",
          click: function () {
            win.hide();
          },
        },
        {
          label: "Afficher",
          click: function () {
            win.show();
          },
        },
        {
          label: "Quitter",
          click: function () {
            if (process.platform !== "darwin") {
              tray.destroy();
              app.quit();
            }
          },
        },
      ],
    },
    {
      label: "Aide",
      submenu: [
        {
          label: "Site",
          click: function (menuItem, browserWindow, event) {
            openExternal(event, "https://loicnogier.fr");
          },
        },
        {
          label: "Github",
          click: function (menuItem, browserWindow, event) {
            openExternal(event, "https://github.com/loicngr/muzei");
          },
        },
        {
          label: "Twitter",
          click: function (menuItem, browserWindow, event) {
            openExternal(event, "https://twitter.com/Zaekof");
          },
        },
      ],
    },
  ]);
  tray.setToolTip("Muzei");
  tray.setContextMenu(contextMenu);
  tray.on("click", function () {
    if (win.isVisible() === undefined || win.isVisible() === null) return;

    win.isVisible() ? win.hide() : win.show();
  });

  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: ["https://embed.twitch.tv/*channel=*"],
    },
    (details, cb) => {
      let redirectURL = details.url;

      const params = new URLSearchParams(
        redirectURL.replace("https://embed.twitch.tv/", "")
      );
      if (params.get("parent") != "") {
        cb({});
        return;
      }
      params.set("parent", "localhost");
      params.set("referrer", "https://localhost/");

      redirectURL = "https://embed.twitch.tv/?" + params.toString();
      console.log("Adjust to", redirectURL);

      cb({
        cancel: false,
        redirectURL,
      });
    }
  );

  // works for dumb iFrames
  session.defaultSession.webRequest.onHeadersReceived(
    {
      urls: ["https://player.twitch.tv/*", "https://embed.twitch.tv/*"],
    },
    (details, cb) => {
      const responseHeaders = details.responseHeaders;

      console.log("headers", details.url, responseHeaders);

      if (responseHeaders) {
        delete responseHeaders["Content-Security-Policy"];
      }
      //console.log(responseHeaders);

      cb({
        cancel: false,
        responseHeaders,
      });
    }
  );
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(app_scheme, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(app_scheme);
}

function launchNotification(
  e: Event | Electron.KeyboardEvent,
  opt: NotificationOpt
): void {
  const notification = new Notification(opt.options);
  notification.show();

  notification.addListener("click", () => shell.openExternal(opt.onClick));
}

async function openExternal(e: Event | Electron.KeyboardEvent, url: string) {
  await shell.openExternal(url);
}

ipcMain.on(IPC_OPEN_EXTERNAL, openExternal);
ipcMain.on(IPC_LAUNCH_NOTIFICATION, launchNotification);

function parseFragment(hash: string): string | null {
  const hashMatch = function (expr: RegExp) {
    const match = hash.match(expr);
    return match ? match[1] : null;
  };
  return hashMatch(/access_token=(\w+)/);
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }

    const cmdLength = commandLine.length;
    const cmdLastElement = commandLine[cmdLength - 1];
    const userOauthToken = parseFragment(cmdLastElement);
    if (userOauthToken)
      win.webContents.send(IPC_USER_OAUTH_TOKEN, userOauthToken);
  });
}
