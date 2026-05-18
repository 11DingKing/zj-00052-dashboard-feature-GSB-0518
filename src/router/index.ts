import { createRouter, createWebHistory } from "vue-router";
import DashboardList from "@/views/DashboardList.vue";
import DashboardView from "@/views/DashboardView.vue";
import DataSourceManager from "@/views/DataSourceManager.vue";
import SharedDashboardView from "@/views/SharedDashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "list", component: DashboardList },
    { path: "/dashboard/:id", name: "view", component: DashboardView },
    {
      path: "/data-sources",
      name: "dataSources",
      component: DataSourceManager,
    },
    { path: "/share/:token", name: "share", component: SharedDashboardView },
  ],
});

export default router;
