import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL+"Criterio"
});

export const getAllCriterios = () => {
    return api.get("/");
};

export const crearCriterio = (criterio) => {
    return api.post("/", criterio);
};

export const eliminarCriterio = (id) => {
    return api.delete(`/${id}/`);
};

export const getCriterio = (id) => {
    return api.get(`/${id}/`);
};




export const actualizarCriterio = (id, Criterios) => {
    return api.put(`/${id}/`, Criterios);
};