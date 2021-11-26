module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "muzei",
        appId: "fr.loicngr.muzei",
        copyright: "OpenSource github.com/loicngr/muzei",
        nsis: {
          oneClick: false,
          perMachine: true,
          allowElevation: false,
          allowToChangeInstallationDirectory: true,
          runAfterFinish: true,
          deleteAppDataOnUninstall: true,
          shortcutName: "Muzei",
        },
      },
    },
    quasar: {
      importStrategy: "kebab",
      rtlSupport: false,
    },
  },

  transpileDependencies: ["quasar"],
};
