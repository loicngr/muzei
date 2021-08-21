<template>
  <div>Welcome {{ userLogin }}</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { UserData } from "@/utils/types/user";

export default defineComponent({
  name: "Dashboard",
  setup() {
    const store = useStore();

    const user = ref<UserData | null>(store.getters["userData"]);

    const userLogin = computed<string | null>(() => {
      if (user.value) return user.value.login;
      return null;
    });

    return {
      userLogin,
    };
  },
});
</script>
