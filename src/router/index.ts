import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import store from "@/store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Main",
    redirect: () => {
      if (!store.getters["userIsConnected"]) {
        return { name: "Landing" };
      }
      return {
        name: "Home",
      };
    },
  },
  {
    path: "/landing",
    name: "Landing",
    component: () => import("../views/Landing.vue"),
    meta: {
      requiresLogin: false,
    },
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: {
      requiresLogin: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const userIsConnected = store.getters["userIsConnected"];
  if (
    to.matched.some((record) => record.meta.requiresLogin) &&
    !userIsConnected
  ) {
    next("/");
  } else {
    next();
  }
});

export default router;
