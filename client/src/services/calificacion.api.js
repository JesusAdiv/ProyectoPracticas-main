import axios from 'axios'


const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + "Calificacion"
  });

export const getAllCalificaciones = () => {
    return api.get('/');
}

export const createCalificacion = (calificacion) => {
    return api.post('/', calificacion);
}

export const deleteCalificacion = (id) => {
    return api.delete(`/${id}/`);
}


export const getCalificacion = (id, calificacion) => {
    return api.get(`/${id}/`, calificacion);
}   
    
export const getCalificacionesByNRC = (nrc) => {
    return api.get("/getCalificacionesByNRC/?nrc="+nrc);
}

export const getCalificacionesByEntrega = (id_entrega) => {
    return api.get("/getCalificacionesByEntrega/?id="+id_entrega);
}



export const updateCalificacion = (id, calificacion) => api.patch(`/${id}/`,calificacion);