<template>
  <div class="col self-center">
    <q-btn label="Connexion" color="purple" icon="login" @click="logIn" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { OAUTH_ENDPOINT } from "@/utils/api";
import { ipcRenderer } from "electron";
import { IPC_OPEN_EXTERNAL } from "@/utils/event";

export default defineComponent({
  name: "Login",
  methods: {
    logIn() {
      const oauthEndpoint: string = OAUTH_ENDPOINT();
      ipcRenderer.send(IPC_OPEN_EXTERNAL, oauthEndpoint);
    },
  },
});
</script>
