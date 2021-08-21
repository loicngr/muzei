import { defineComponent } from "vue";
import _ from "lodash";
import { eventsHandler } from "@/utils/types/mixins";

export default defineComponent({
  name: "eventsHandler",
  data() {
    return {
      eventsHandler: <eventsHandler>{
        autoInit: false,
        autoDestroy: false,
        events: [],
      },
    };
  },
  mounted() {
    if (this.eventsHandler.autoInit) this._eventsHandler(true);
  },
  beforeUnmount() {
    if (this.eventsHandler.autoDestroy) this._eventsHandler(false);
  },
  methods: {
    _eventsHandler(status: boolean) {
      const events = _.cloneDeep(this.eventsHandler.events);

      if (status) {
        for (const event of events) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.addEventListener(event.type, this[event.action], true);
        }
      } else if (!status) {
        for (const event of events) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.removeEventListener(event.type, this[event.action], true);
        }
      }
    },
  },
});
