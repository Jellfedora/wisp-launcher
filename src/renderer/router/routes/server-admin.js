const routes = [
  {
    path: '/serveur-admin',
    name: 'Administration du serveur',
    component: () => import('@/views/EmptyLayout.vue'),
    children: [
      {
        path: 'index',
        name: 'SAIndex',
        component: () => import('@/views/serveur-admin/ServeurAdminIndex.vue'),
      },
      {
        path: 'modslist',
        name: 'SAModsList',
        component: () => import('@/views/serveur-admin/modslist/ServeurAdminModsListIndex.vue'),
      },
    ],
  }
]

export default routes