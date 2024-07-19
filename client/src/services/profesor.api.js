import axios from 'axios'


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "Profesor"
});

export const getAllProfesores = () => {
  return api.get('/');
}


export const createProfesor = (profesor) => {
  return api.post('/', profesor);
}

export const deleteProfesor = (id) => {
  return api.delete(`/${id}/`);
}


export const getProfesor = (id) => {
  return api.get(`/${id}/`);
}

export const getProfesorByCorreo = (correo) => {
  console.log("Llamada desde axios")
  console.log(correo)
  return api.get("/?search="+correo)
}

export const updateProfesor = (id, profesor) => api.put(`/${id}/`, profesor);

export const actualizarDatosProfesores = (datosProfesores) => {return api.post("/actualizarDatosProfesores/", datosProfesores)};

export const revisarEstadoSesion = (id_profesor, token) => {
 return api.post("/"+id_profesor+"/verificarEstadoSesion/",{"token":token})

}

export const autenticarProfesor = (correo, password) => {
 return api.get("/autenticarProfesor/?correo="+correo+"&password="+password)
}

export const resetPassword = (id_profesor) => api.post(`/${id_profesor}/reiniciarContrasena/`);