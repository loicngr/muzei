module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "muzei",
        appId: "fr.loicngr.muzei",
        nsis: {
          oneClick: false,
          perMachine: true,
          allowElevation: false,
          allowToChangeInstallationDirectory: true,
          runAfterFinish: true,
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
