import axios from 'axios'


const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + "Entrega"
  });

export const getAllEntregas = () => {
    return api.get('/');
}

export const createEntrega = (entrega) => {
    return api.post('/', entrega);
}

export const deleteEntrega = (id) => {
    return api.delete(`/${id}/`);
}


export const getEntrega = (id, entrega) => {
    return api.get(`/${id}/`, entrega);
}

export const getEntregasByNRC = (nrc) => {
    return api.get(`/getEntregasByNRC/?nrc=${nrc}`); 
}

export const getEntregasByTipo = (tipo) => {
    return api.get(`/?search=${tipo}`)
}

export const updateEntrega = (id, entrega) => api.patch(`/${id}/`,entrega);