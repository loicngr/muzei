<template>
  <q-page
    padding
    class="fit row no-wrap justify-center items-center content-center"
  >
    <Login />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Login from "@/components/Login.vue";

export default defineComponent({
  name: "Landing",
  components: {
    Login,
  },
});
</script>
