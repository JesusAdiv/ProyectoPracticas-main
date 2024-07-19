import axios from 'axios'


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "Alumno"
});

export const getAllAlumnos = () => {
  return api.get('/');
}


export const createAlumno = (alumno) => {
  return api.post('/', alumno);
}

export const deleteAlumno = (id) => {
  return api.delete(`/${id}/`);
}


export const getAlumno = (id, alumno) => {
  return api.get(`/${id}/`, alumno);
}


export const updateClase = (id, alumno) => api.put(`/${id}/`, alumno);

