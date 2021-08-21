<template>
  <div class="col-3 self-center">
    <q-btn label="Déconnexion" color="purple" icon="logout" @click="logOut" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { STORE_USER_LOGOUT } from "@/store/consts";

export default defineComponent({
  name: "Logout",
  methods: {
    logOut() {
      this.$store.dispatch(STORE_USER_LOGOUT);
    },
  },
});
</script>
