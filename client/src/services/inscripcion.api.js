import axios from 'axios';
  /*
     -------------------------------------------
     ----- CRUD para el modelo Inscripcion -----
     -------------------------------------------

  */

  // ------------
  // ---Create---
  // ------------

  // 1. Crear un registro para inscripcion

  export const crearInscripcion = (matricula, nrc) => {

    let inscripcion = {
      "clase": nrc,
      "alumno": matricula,
     };

    axios.post(import.meta.env.VITE_BACKEND_URL + "Inscripcion/", inscripcion).then(res => res.data);     
 }


  // 2. Crear varios registros para el modelo Inscripcion pasando la lista de alumnos y el nrc de la materia
  export const crearListaInscripcion = async (matriculas, nrc) => {
    //console.log("In")
    let promesas = matriculas.map(matricula => {
        let inscripcion = {
            "clase": nrc,
            "alumno": matricula,
            "estado": "PENDIENTE"
        };
       // console.log("Inscripcion: "+matricula+", "+nrc+","+inscripcion);
        // Retorna la promesa de la solicitud POST
        return axios.post(import.meta.env.VITE_BACKEND_URL+"Inscripcion/", inscripcion);

    });
    // Retorna una promesa que se resuelve cuando todas las solicitudes POST han sido completadas
    return await Promise.all(promesas);
}


  // ----------
  // ---Read---
  // ----------

  // 1. Obtener todas los registros existentes de la tabla Inscripcion
  export const obtenerInscripciones = () => {
    axios.get(import.meta.env.VITE_BACKEND_URL+"Inscripcion/").then( res => 
    {
    // console.log(res.data);
    });      
  }
  
  // 2. Obtener todos los registros cuyo nrc sea igual al de la clase buscada.
  export const obtenerListaAlumnos = async (nrc) => {
    const response = await axios.get(import.meta.env.VITE_BACKEND_URL+"Inscripcion/?search="+nrc);
   // console.log(response.data);
    return response.data;
}

  // ------------------
  // --- Update ---
  // ------------------


  // Update (Duda)
  export const actualizarInscripcion = () => {

  }

  export const activarInscripciones = (nrc) => axios.post(import.meta.env.VITE_BACKEND_URL+"Inscripcion/activarInscripciones/", {"clase":"","alumno":"","estado":"", "nrc":nrc});
 