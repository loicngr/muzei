import "./styles/quasar.scss";
import lang from "quasar/lang/fr.js";
import "@quasar/extras/material-icons/material-icons.css";
import { Dialog, Loading, Notify } from "quasar";

const quasarUserOptions = {
  config: {},
  plugins: {
    Dialog,
    Loading,
    Notify,
  },
  lang: lang,
};

export { quasarUserOptions };
