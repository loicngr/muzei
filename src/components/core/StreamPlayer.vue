<template>
  <div>
    <iframe
      :src="
        'https://player.twitch.tv/?channel=' +
        value.username +
        '&parent=localhost&muted=true'
      "
      frameborder="0"
      parent="localhost"
      allowfullscreen="true"
      scrolling="no"
      :height="playerHeight"
      :width="value.width"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
  StreamPlayerStubValue,
  StreamItemValue,
  StreamChatStubValue,
} from "@/utils/types";
import { determineHeight } from "@/utils";

export default defineComponent({
  name: "StreamPlayer",
  props: {
    value: {
      type: Object as PropType<StreamItemValue>,
      default: () => StreamPlayerStubValue,
    },
  },
  computed: {
    playerHeight(): number {
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
