const routes = [
  {
    path: '/guilds',
    name: 'Sélection Serveur',
    component: () => import('@/views/EmptyLayout.vue'),
    children: [
      {
        path: 'choose',
        name: 'Sélection Serveur',
        component: () => import('@/views/guilds/GuildsChoose.vue'),
      },
      {
        path: 'add',
        name: 'Ajout Serveur',
        component: () => import('@/views/guilds/GuildsAdd.vue')
      }
    ]
  }
]

export default routes