import axios from 'axios'
import { useAuthStore } from '@/stores/authStore.js'
import { toast } from 'vue3-toastify'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const vApi = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  // Bearer token
  headers: {
    Authorization: '', // Le token sera ajouté dynamiquement avant chaque requête
  },
})

// Intercepteur pour ajouter le token à chaque requête sortante
axiosInstance.interceptors.request.use(
  async (config) => {
    const userToken = await authStore.getUserToken()
    config.headers.Authorization = `Bearer ${userToken}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer le refresh du token + autres erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    // console.log(response)
    if (response.data && response.data.success && response.data.user) {
      // On met à jour les informations de l'utilisateur dans le store
      authStore.setUserInfo(response.data.user)
    }
    return response
  },
  async (error) => {
    console.log(error)
    // Si l'api ne répond pas
    if (error.code === "ERR_NETWORK") {
      toast.error('Erreur de connexion au serveur, veuillez réessayer plus tard.')
      return Promise.reject(error)
    } else if (error.code === "ERR_BAD_REQUEST" && error.response && error.response.data && error.response.data.error === "Route non trouvée") {
      toast.error('Oups, cela n\'aurait pas dû arriver. Veuillez réessayer plus tard.')
      console.error('La route appellée par l\'api n\'a pas été trouvée')
      return Promise.reject(error)
    } else if (error.response && error.response.data && error.response.data.action) {
      switch (error.response.data.action) {
        // L'utilisateur n'est pas enregistré dans la base de données
        case 'disconnect':
          await authStore.forceDisconnectUser(
            'Votre compte n\'a pas été trouvé dans notre base, donc vous avez été déconnecté. Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter le support.'
          )
          break
        case 'ban':
          await authStore.forceDisconnectUser(
            'Votre compte est banni depuis le: ' + dayjs(error.response.data.ban_at).format('DD/MM/YYYY') + ' pour la raison suivante: ' + error.response.data.ban_reason + '. Vous allez être déconnecté. Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter le support.'
          )
        case 'invalid_token':
          await authStore.forceDisconnectUser(
            'Votre session a expiré, veuillez vous reconnecter.'
          )
          break
        // TODO gérer le cas ou l'utilisateur ne fait plus partie du discord connecté
        default:
          toast.error('Une erreur est survenue, veuillez réessayer.')
          break
      }
    }
    return Promise.reject(error)
  }
)

// Fonction pour effectuer une requête GET
export async function getToVApi (url, config = {}) {
  const vApiUrl = vApi + url
  const response = {
    success: false,
    data: null
  }
  try {
    const axiosResponse = await axiosInstance.get(vApiUrl, config)
    response.success = true
    response.data = axiosResponse.data
    return response
  } catch (error) {
    console.error(`Erreur lors de la requête GET vers ${vApiUrl}: ${error.message}`)
    // throw new Error(`Erreur lors de la requête GET vers ${vApiUrl}: ${error.message}`)
    response.data = error.response?.data
    return response
  }
}

// Fonction pour effectuer une requête POST
export async function postToVApi (url, data, config = {}) {
  const vApiUrl = vApi + url
  const response = {
    success: false,
    data: null
  }
  try {
    const axiosResponse = await axiosInstance.post(vApiUrl, data, config)
    response.success = true
    response.data = axiosResponse.data
    return response
  } catch (error) {
    console.error(`Erreur lors de la requête POST vers ${vApiUrl}: ${error.message}`)
    // throw new Error(`Erreur lors de la requête POST vers ${vApiUrl}: ${error.message}`)
    response.data = error.response.data
    return response
  }
}

export async function deleteToVApi (url, data, config = {}) {
  const vApiUrl = vApi + url
  const response = {
    success: false,
    data: null
  }
  try {
    const axiosResponse = await axiosInstance.delete(vApiUrl, { data: data }, config)
    response.success = true
    response.data = axiosResponse.data
    return response
  } catch (error) {
    console.error(`Erreur lors de la requête DELETE vers ${vApiUrl}: ${error.message}`)
    // throw new Error(`Erreur lors de la requête DELETE vers ${vApiUrl}: ${error.message}`)
    response.data = error.response.data
    return response
  }
}

export async function putToVApi (url, data, config = {}) {
  const vApiUrl = vApi + url
  const response = {
    success: false,
    data: null
  }
  try {
    const axiosResponse = await axiosInstance.put(vApiUrl, data, config)
    response.success = true
    response.data = axiosResponse.data
    return response
  } catch (error) {
    console.error(`Erreur lors de la requête PUT vers ${vApiUrl}: ${error.message}`)
    // throw new Error(`Erreur lors de la requête PUT vers ${vApiUrl}: ${error.message}`)
    response.data = error.response.data
    return response
  }
}