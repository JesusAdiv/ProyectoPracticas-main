import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + "Clase2/"
});

export const getAllClases = () => {
    return api.get("/");
};

export const getClasesByProfesor = (profesor) => {
    return api.get("/getClasesByProfesor/?profesor="+profesor)
}

export const crearClase = (Clase) => {
    return api.post("/", Clase);
};

export const eliminarClase = (id) => {
    return api.delete(`/${id}/`);
};



export const actualizarClase = (id, datosActualizados) => {
    return api.put(`/${id}/`, datosActualizados);
};


