import axios from 'axios'


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL +"ClaseCriterio"
});

export const getAllClaseCriterio = () => {
  return api.get('/');
}


export const createClaseCriterio = (criterio) => {
  return api.post('/', criterio);
}

export const deleteClaseCriterio = (id) => {
  return api.delete(`/${id}/`);
}


export const getClaseCriterio = (id) => {
  return api.get(`/${id}/`);
}

export const getCriteriosByNRC = (nrc) => {
  return api.get('/?search='+nrc);
};


export const updateClaseCriterio = (id, criterio) => api.patch(`/${id}/`, criterio );