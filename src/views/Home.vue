<template>
  <q-page>
    <q-list class="q-ma-none q-pa-none" bordered separator>
      <q-item v-if="!usersOnStreams || usersOnStreams.length === 0">
        <q-item-section>
          <div class="row justify-start">
            <div class="col-2 column justify-center items-center">
              <p>Aucune données à afficher :/</p>
            </div>
          </div>
        </q-item-section>
      </q-item>
      <q-item
        clickable
        v-for="userOnStream in usersOnStreams"
        :key="userOnStream.id"
      >
        <q-item-section @click="openUserOnStreamClick($event, userOnStream)">
          <UserStreamStatusItem :value="userOnStream" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import { UserStreamsData } from "@/utils/types/user";
import _ from "lodash";
import UserStreamStatusItem from "@/components/core/UserStreamStatusItem.vue";
import { ipcRenderer } from "electron";
import { IPC_OPEN_EXTERNAL } from "@/utils/event";
import { buildTwitchChannelLink } from "@/utils";

export default defineComponent({
  name: "Home",
  components: {
    UserStreamStatusItem,
  },
  mixins: [],
  setup() {
    const store = useStore();

    const usersOnStreams = computed<UserStreamsData[]>(() => {
      const _users = _.get(store.getters["usersOnStreams"], "data", []);
      return _.sortBy(_users, "viewer_count").reverse();
    });

    return {
      usersOnStreams,
    };
  },
  methods: {
    openUserOnStreamClick(e: MouseEvent, userOnStream: UserStreamsData) {
      ipcRenderer.send(
        IPC_OPEN_EXTERNAL,
        buildTwitchChannelLink(userOnStream.user_login)
      );
    },
  },
});
</script>
