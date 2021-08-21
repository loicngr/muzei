<template>
  <q-page class="fit" v-if="!loading">
    <StreamPlayer
      class="absolute-left"
      :value="{
        username: username,
        width: playerWidth,
        height: playerHeight,
        forced: true,
      }"
    />
    <StreamChat
      class="absolute-right"
      :value="{
        username: username,
        width: chatWidth,
        height: chatHeight,
        forced: true,
      }"
    />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import StreamPlayer from "@/components/core/StreamPlayer.vue";
import StreamChat from "@/components/core/StreamChat.vue";
import { Loading } from "quasar";
import { useStore } from "@/store";
import { CONST_LEFT_DRAWER_WIDTH, CONST_STREAM_CHAT_WIDTH } from "@/consts";
import eventsHandler from "@/mixins/eventsHandler";

export default defineComponent({
  name: "Stream",
  components: {
    StreamPlayer,
    StreamChat,
  },
  mixins: [eventsHandler],
  data() {
    return {
      eventsHandler: {
        autoInit: true,
        autoDestroy: true,
        events: [{ type: "resize", action: "onEventResize" }],
      },
      loading: true,
      username: null as null | string,
    };
  },
  setup() {
    const store = useStore();
    const screenWidth = ref(window.innerWidth);
    const screenHeight = ref(window.innerHeight);
    const leftDrawerOpen = computed(() => store.getters["isLeftDrawerOpen"]);

    const updateScreenWidth = (width: number) => {
      screenWidth.value = width;
    };
    const updateScreenHeight = (height: number) => {
      screenHeight.value = height;
    };

    const playerWidth = computed<number>(() => {
      return (
        (leftDrawerOpen.value
          ? screenWidth.value - CONST_LEFT_DRAWER_WIDTH
          : screenWidth.value) - CONST_STREAM_CHAT_WIDTH
      );
    });

    const chatWidth = computed<number>(() => {
      return CONST_STREAM_CHAT_WIDTH;
    });

    const playerHeight = computed<number>(() => {
      return screenHeight.value;
    });

    const chatHeight = computed<number>(() => {
      return screenHeight.value;
    });

    return {
      updateScreenHeight,
      updateScreenWidth,
      playerHeight,
      playerWidth,
      chatHeight,
      chatWidth,
    };
  },
  created() {
    Loading.show({
      message: "Chargement",
    });

    const { username } = this.$route.query;
    if (!username) {
      Loading.hide();
      this.$router.go(-1);
      return;
    }

    this.username = username.toString();
    this.loading = false;
    Loading.hide();
  },
  methods: {
    onEventResize() {
      this.updateScreenWidth(window.innerWidth);
      this.updateScreenHeight(window.innerHeight);
    },
  },
});
</script>
