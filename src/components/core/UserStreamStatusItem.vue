<template>
  <div class="row justify-start">
    <div class="col-2 column justify-center items-center">
      <q-avatar size="40px">
        <q-img loading="lazy" :src="getUserProfilePic(value.user_id)" />
      </q-avatar>
    </div>
    <div class="col-10 column text-left justify-center items-start">
      <div class="row q-pl-md">
        <div class="col-8">
          {{ value.user_name }}
        </div>
        <div class="col-12 text-caption">
          {{ value.game_name }}
        </div>
      </div>
      <div class="absolute-top-right" style="top: 7px; right: 10px">
        <q-icon name="visibility" />
        {{ numberHumanReadable(value.viewer_count) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { stubUserStreamsData, UserStreamsData } from "@/utils/types/user";
import { getUserProfilePic, numberHumanReadable } from "@/utils";

export default defineComponent({
  name: "UserStreamStatusItem",
  props: {
    value: {
      type: Object as PropType<UserStreamsData>,
      default: () => stubUserStreamsData,
    },
  },
  methods: {
    getUserProfilePic,
    numberHumanReadable,
  },
});
</script>
