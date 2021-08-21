<template>
  <div>
    <iframe
      :src="
        'https://www.twitch.tv/embed/' +
        value.username +
        '/chat?parent=localhost'
      "
      :height="chatHeight"
      :width="value.width"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { StreamChatStubValue, StreamItemValue } from "@/utils/types";
import { determineHeight } from "@/utils";

export default defineComponent({
  name: "StreamChat",
  props: {
    value: {
      type: Object as PropType<StreamItemValue>,
      default: () => StreamChatStubValue,
    },
  },
  computed: {
    chatHeight(): number {
      const { forced, width, height } = this.value;
      if (forced && height) {
        return height;
      }
      return width
        ? this.determineHeight(width)
        : this.determineHeight(StreamChatStubValue.width);
    },
  },
  methods: {
    determineHeight,
  },
});
</script>
