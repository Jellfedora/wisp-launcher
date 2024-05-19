import { createRouter, createWebHistory } from 'vue-router'

function routesLoader (fileList) {
  const pathList = []
  for (const path in fileList) {
    pathList.push(path)
  }
  let routes = pathList.reduce((routes, path) => {
    const moduleName = path.replace(/^\.\/routes\/(.*)\/(.*)\.\w+$/, '$2')
    const value = fileList[path]
    routes[moduleName] = value.default
    return routes
  }, {})
  routes = [].concat.apply([], Object.values(routes))
  return routes
}

const appRoutes = routesLoader(import.meta.glob("./routes/*.js", { eager: true }))

const Routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/home',
    component: () => import('@/views/EmptyLayout.vue'),
    meta: { title: 'Accueil', icon: 'el-icon-s-home', affix: true },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/HomeIndex.vue'),
        order: 1,
        meta: { title: 'Accueil', icon: 'el-icon-s-home', affix: true }
      },
      ...appRoutes
    ]
  }
]

// export des routes
export const constantRoutes = Routes
export const asyncRoutes = []

// creation du router
export const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

export default router
