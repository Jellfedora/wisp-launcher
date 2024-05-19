const routes = [
  {
    path: '/connected-serveur',
    name: 'Serveur connecté',
    component: () => import('@/views/connected-server/ConnectedServerIndex.vue')
  }
]

export default routes