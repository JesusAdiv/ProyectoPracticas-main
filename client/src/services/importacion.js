import { createEntrega } from "./entrega.api";

import axios from "axios";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import toast from "react-hot-toast";

export const manejarArchivo = (e, setArchivo) =>{
  let archivoSeleccionado = e.target.files[0];

  if (archivoSeleccionado) {
    let tipoArchivo = archivoSeleccionado.type;
    console.log(tipoArchivo);

    if(tipoArchivo === "application/pdf")
    {
     let leerArchivo = new FileReader();
     leerArchivo.readAsArrayBuffer(archivoSeleccionado);
     leerArchivo.onload = (e) => {
      setArchivo(e.target.result);
     };
    }
    else if(tipoArchivo === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") { // Validar que sea un archivo PDF
      let leerArchivo = new FileReader();
      leerArchivo.readAsArrayBuffer(archivoSeleccionado);
      leerArchivo.onload = (e) => {
        setArchivo({"datos":e.target.result,"tipo":1});
      };
    }
    else if(tipoArchivo === "text/csv")
    {
     Papa.parse(archivoSeleccionado, {
      complete: (res) => {
       setArchivo({"datos":res,"tipo":2});
      }
     })
     //setArchivoCalificaciones()
    }
    else
    {
     //setResultadoExtraccion(3);
    } 

  }
}


  //
  // ---------------------------------------------------------------------------------------------------------
  //  Esta funcion permite crear un arreglo de objetos (JSON) con las calificaciones encontradas dentro del 
  //  archivo de Excel que genera Teams para poder almacenarlas posteriormente en la base de datos.
  // ---------------------------------------------------------------------------------------------------------
  //

  const crearListaCalificaciones = async (archivoCalificaciones, setCalificacionesExtraidas, setCalificacionesCompletas, datosCalificaciones, posicionIdentificador, posicionNota, notaMaxima, nrc) => {
    let calificacionesEncontradas = [];
    let correo = "";
    let inscripciones = await axios.get("http://127.0.0.1:8000/api/Inscripcion/?search="+nrc);
    let listaAlumnos = inscripciones.data.map( (inscripcion) => inscripcion.alumno_detail);
    console.log(inscripciones)
    for(let d of datosCalificaciones)
    {
     let datosAlumno;
      if(archivoCalificaciones.tipo == 1)
      {
       correo = d.split(">")[posicionIdentificador.correo];
       console.log(d.split(">"));
       datosAlumno = listaAlumnos.find( (alumno) => alumno.correo == correo)
      }
      else
      {
       
       let identificador = d.split(">")[posicionIdentificador.apellidos] + d.split(">")[posicionIdentificador.nombre]
       console.log("Apellidos:"+posicionIdentificador.apellidos+", Nombre:"+posicionIdentificador.nombre);
       datosAlumno = listaAlumnos.find( (alumno) => (alumno.apellidos + alumno.nombre) == identificador)
       
      }
      if(datosAlumno)
      {
       let nota = (parseFloat(d.split(">")[posicionNota]) * 10.0) / notaMaxima;
       if(isNaN(nota))
        nota=0; 
       let calificacion = {
        "nota": nota,
        "matricula": datosAlumno.matricula,
        "id_entrega": -1
       };
       calificacionesEncontradas.push(calificacion);
       console.log(calificacion)
      }
    }
    if(calificacionesEncontradas.length==listaAlumnos.length)
    {
     setCalificacionesCompletas(true);
    }
    else
    {
     toast.error("¡Parece que hay un problema!, verifique que el archivo seleccionado contenga las calificaciones de todos los alumnos inscritos en esta clase.",{"duration":10000});
    }
    setCalificacionesExtraidas(calificacionesEncontradas);
    console.log("Calificaciones:")
    console.log(calificacionesEncontradas);

   }


/*const validarNombreEntrega = (contenidoArchivo) => {
  return contenidoArchivo.includes(entrega.nombre);
 }*/


  const darFormatoNombre = (nombreProfesor) => {
    let auxNombreNormalizado = nombreProfesor.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    let nombreNormalizado = auxNombreNormalizado.toUpperCase();
    console.log(nombreNormalizado);
    return nombreNormalizado;
   }
  
   const obtenerDatosProfesores = (contenidoPDF, setProfesores) => {
    let contenidoBuscado = /[A-ZÁÉÍÓÚÑ][ \wÑÁÉÍÓÚñáéíóú@.|]+mx/g;
    let listaDatosProfesores = contenidoPDF.match(contenidoBuscado);
    let listaProfesores = []
    //console.log(listaDatosProfesores); 
    for(let datosProfesor of listaDatosProfesores)
    {
     let [nombreProfesor, correo] = datosProfesor.split("|");
     console.log("Profesor:"+nombreProfesor+", Correo:"+correo)
     let nombreProcesado = darFormatoNombre(nombreProfesor);
     let profesor = {
      "nombre": nombreProcesado,
      "correo": correo,
     }
     listaProfesores.push(profesor);
    }
    setProfesores(listaProfesores);
    console.log("Profesores:")
    console.log(listaProfesores)
   }

  
  const esArchivoProfesores = (contenidoPDF) => {
    let existeCampoNombre = contenidoPDF.search(/Nombre/g) != -1?true:false;
    let existeCampoCorreo = contenidoPDF.search(/Correo/g) != -1?true:false;
    
    let esPDFProfesores = existeCampoNombre && existeCampoCorreo;
    return esPDFProfesores;
   }


  //
 // -----------------------------------------------------------------------------
 // Funcion la cual permite validar si la estructura interna del Excel es valida.
 // ------------------------------------------------------------------------------
 //
 //  ---------------
 //  ---Variables---
 //  ---------------
 //
 //  -------------------------------------------------------------------
 //   existeCorreo, existeNota, esValido -> Booleano
 //  -------------------------------------------------------------------
 //

 const validarEstructuraCalificaciones = (contenidoArchivo) => {
   const campoCorreo = /\w+\.\w+@alumno.buap.mx/g;
   const campoNombre = /Nombre/g;
   const campoApellidos = /Apellidos/g
   const campoNota = /(Puntos|Calificación),/g;

   let existeCorreo = contenidoArchivo.search(campoCorreo) != -1?true:false;
   let existeNombre = contenidoArchivo.search(campoNombre) != -1?true:false;
   let existenApellidos = contenidoArchivo.search(campoApellidos) != -1?true:false;
   let existeNota = contenidoArchivo.search(campoNota) != -1?true:false;
   console.log("Correo:"+existeCorreo+" Nota:"+existeNota); 
   let esValido = (existeCorreo || (existeNombre && existenApellidos)) && existeNota;
   return esValido;

  } 

 const transformarFechaFormatoDjango = (fecha) => {
  let fechaDjango = "";
  console.log("Fecha: "+fecha)
  let [ mes, dia, año ] = fecha.split("/");
  fechaDjango = "20"+año+"-"+mes+"-"+dia;
  return fechaDjango;
 }

 const generarFormatoJSONEntrega = (nombreEntrega, tipo, fecha) => {
  let entregaJSON = {
   "nombre": nombreEntrega,
   "tipo": tipo,
   "fecha": transformarFechaFormatoDjango(fecha),
   "estado":"PENDIENTE"
  }

  return entregaJSON;
 }
 //
 // --------------------------------------------------------
 //  Funcion que permite la extraccion de los datos del Excel
 // --------------------------------------------------------
 //
 export const leerArchivoEntrega = async (archivoEntrega, setMostrarEntregaExtraida, setEntregaExtraida, setCalificacionesExtraidas, setCalificacionesCompletas, tipo, nrc) =>{
   //e.preventDefault();
   console.log("l")
   let toastExtraccion = toast.loading("Extrayendo los datos del Excel...");
   if(archivoEntrega!=null)
   { //Se verifica si el usuario ha seleccionado el archivo Excel.
     if(archivoEntrega.tipo == 1)
     {
      const workbook =  XLSX.read(archivoEntrega.datos, {type: 'buffer'});
      const worksheetName =  workbook.SheetNames[0];
      const worksheet =  workbook.Sheets[worksheetName];
      console.log(worksheet);
      console.log(XLSX.utils.sheet_to_csv(worksheet, {RS:"&&", FS:">"}))
      const excelValido = validarEstructuraCalificaciones(XLSX.utils.sheet_to_csv(worksheet));
      //const existeNombreEntrega = validarNombreEntrega(XLSX.utils.sheet_to_txt(worksheet));
      if(!excelValido)
      {
       toast.error("¡La estructura del archivo no es valida!, verifica que el archivo contenga el nombre de la entrega que desea importar y sus calificaciones")
      }
      else
      {
       let archivoEditado = false;
       let datosCalificaciones =  XLSX.utils.sheet_to_csv(worksheet, {RS:"&&", FS:">"});
      // console.log(datosCalificaciones)
       let auxCalificaciones = datosCalificaciones.split("&&").filter( (fila) => fila.search(/[\d\w]/g)!= -1);
       if(auxCalificaciones[0].toString().includes("Datos de") == true)
       {
        archivoEditado = true;
       }
       auxCalificaciones.shift();
       let posicionIdentificador = {
        "correo": archivoEditado?6:3
       };
       let posicionNombreEntrega = archivoEditado?7:4;
       let posicionNota = archivoEditado?12:9;
       let posicionNotaMaxima = archivoEditado?13:10;
       let posicionFecha = archivoEditado?8:5;
       let nombreEntrega = auxCalificaciones[1].split(">")[posicionNombreEntrega];
       let fecha = auxCalificaciones[1].split(">")[posicionFecha];
       let notaMaxima = auxCalificaciones[1].split(">")[posicionNotaMaxima];

       console.log(auxCalificaciones[1].split(">"))
       if(archivoEditado)
        auxCalificaciones.shift();
       //auxCalificaciones.shift();
       console.log("Calificaciones extraidas:")
       console.log(auxCalificaciones)
       let entregaExtraida = generarFormatoJSONEntrega(nombreEntrega, tipo, fecha)
       crearListaCalificaciones(archivoEntrega, setCalificacionesExtraidas, setCalificacionesCompletas,auxCalificaciones,posicionIdentificador,posicionNota,notaMaxima,nrc);
       console.log(entregaExtraida)
       setEntregaExtraida(entregaExtraida);

       setMostrarEntregaExtraida(true);
       toast.dismiss(toastExtraccion)
       toast.success("¡Se han extraido los datos exitosamente!");
       //setResultadoExtraccion(0); //Se indica que el proceso de extraccion se realizo correctamente.
      }
     }
     else
     {
      let contenidoArchivoCSV = Papa.unparse(archivoEntrega.datos)
      let archivoValido = validarEstructuraCalificaciones(contenidoArchivoCSV);
     // let existeNombreEntrega = validarNombreEntrega(contenidoArchivoCSV);
      if(!archivoValido)
      {
      // setResultadoExtraccion(2);
      }
      else
      {
       let posicionIdentificador = {
        "nombre": archivoEntrega.datos.data[0].findIndex( (columna) => columna=="Nombre"),
        "apellidos": archivoEntrega.datos.data[0].findIndex( (columna) => columna=="Apellidos")
       }

       let posicionNota = archivoEntrega.datos.data[0].findIndex( (columna) => columna==nrc);
       let notaMaxima = archivoEntrega.datos.data[2][posicionNota];
       //let fecha = archivoCalificaciones.datos.data[1][posicionNota];
       let auxCalificaciones = Papa.unparse(archivoEntrega.datos, {newline:"#"}).split("#");
       crearListaCalificaciones(archivoEntrega,auxCalificaciones,posicionIdentificador, posicionNota,notaMaxima,nrc);
       setMostrarEntregaExtraida(true);
  
      }
     }
   }
   else
   { //Si el usuario aun no ha seleccionado algun archivo, se asignara un valor igual a 4 al estado "resultadoExtraccion".
   // setResultadoExtraccion(4);
   }
  }


export const leerArchivoProfesores = async (archivoProfesores, setProfesores) => {
  if(archivoProfesores!==null)
    { //Se comprueba si el PDF tiene datos.
     let archivoVacio = false;
     let contenidoPDF = ""; //Esta variable permitira almacenar el contenido completo del PDF.
     let listaCriterios = []; //Permite almacenar cada uno de los criterios en formato JSON.
 
     const task = pdfjsLib.getDocument(archivoProfesores); //Se obtiene la referencia al PDF
     try
     {
       const pdf = await task.promise; // Se accede al PDF.
 
       for(let j=1; j<=pdf.numPages; j++)
       {
       const page = await pdf.getPage(j); // Se accede a una de las paginas del PDF.
       const contenidoPagina = await page.getTextContent(); // Se obtiene el contenido de la pagina, distribuyendo cada una 
                                                            // de sus partes en un arreglo.
       
       if( contenidoPagina.items.length <= 1)
       { //Se comprueba si el archivo PDF tiene contenido.
        archivoVacio = true;
       } 
 
       contenidoPagina.items.forEach( function(item)
       { //Se pasara por cada uno de los elementos del arreglo. 
        let elementoString = item.str //Se convierte el elemento en un String.
 
        if(item.hasEOL)
         {
          contenidoPDF = contenidoPDF + "#";
         }
         else if(item.height==0)
         {
          contenidoPDF = contenidoPDF + "|";
         }
         else
         {
          contenidoPDF = contenidoPDF + elementoString;
         }
  
       });
      }
 
      //Se comprueba si el archivo subido tiene el formato que tiene la pagina de Secretaria Academica que almacena los datos de las profesores.
      if(esArchivoProfesores) 
      { 
       obtenerDatosProfesores(contenidoPDF, setProfesores);
       toast.success("¡Se han extraido los datos del PDF exitosamente!"); //Se indica que la extraccion se realizo de forma exitosa.
      }
      else
      {//Si el formato no es valido, entonces se asigna un valor igual a 2 al estado llamado "resultadoExtraccion"
       toast.error("¡La estructura del documento no es valida!");
      }
     } catch(e){
       console.log("!!!Error al intentar cargar el PDF!!!:", e)
     }
   }
  

}



export async function extraerDatosMaterias(archivoPDF) {
  let listaClases = [];
  let numeroCampo = 0;
  let nrc = "NA";
  let clave;
  let materia;
  let seccion;
  let nombreProfesor;
  let archivoVacio = false;

  if (archivoPDF !== null) {
    const task = pdfjsLib.getDocument(archivoPDF);
    try {
      const pdf = await task.promise;

      for (let j = 1; j <= pdf.numPages; j++) {
        const page = await pdf.getPage(j);
        const contenido = await page.getTextContent();

        if (contenido.items.length <= 1) {
          archivoVacio = true;
        }

        contenido.items.forEach(function (item) {
          let elementoString = item.str;

          if (!isNaN(elementoString)) {
            let datoNumerico = parseInt(elementoString);
            if (datoNumerico !== parseInt(nrc)) {
              if ((Math.floor(Math.log10(datoNumerico)) + 1) == 5) {
                numeroCampo++;
              }
            }
          }
          switch (numeroCampo) {
            case 0:
              break;
            case 1:
              nrc = elementoString;
              numeroCampo++;
              break;
            case 2:
              if (elementoString !== " " && elementoString !== "") {
                clave = elementoString;
                numeroCampo++; 
              }
              break;
            case 3:
              if (elementoString !== " ") {
                if (/\d/.test(elementoString)) {
                  clave += elementoString;
                } else {
                  materia = elementoString;
                  numeroCampo++;
                }
              }
              break;
            case 4:
              if (elementoString !== " ") {
                if (/\d/.test(elementoString)) {
                  seccion = elementoString;
                  numeroCampo++;
                } else {
                  materia += elementoString;
                }
              }
              break;
            case 7:
              if (elementoString !== " " && elementoString !== "-") {
                if (/\d/.test(elementoString) == false) {
                  nombreProfesor = elementoString;
                  numeroCampo++;
                }
              }
              break;
            case 8:
              if (elementoString !== " ") {
                if (/\d/.test(elementoString)) {
                  seccion = seccion.replaceAll("O", "0");
                  nombreProfesor = nombreProfesor.replace("-", "");
                  nombreProfesor = nombreProfesor.replace("", " ");
                  let clase = {
                    "nrc": nrc,
                    "clave": clave,
                    "seccion": seccion,
                    "nombreMateria": materia,
                    "nombreProfesor": nombreProfesor.trim(),
                  };
                  console.log(clase);
                  listaClases.push(clase);
                  numeroCampo = 0;
                } else {
                  nombreProfesor = nombreProfesor + elementoString;
                }
              }
              break;
            default:
              if (elementoString !== " ") {
                numeroCampo++;
              }
              break;
          }
        });
      }
      if (archivoVacio) {
        return { resultado: 1, clases: [] };
      } else if (nrc === "NA") {
        return { resultado: 2, clases: [] };
      } else {
        return { resultado: 0, clases: listaClases };
      }
    } catch (e) {
      console.log("!!!Error al intentar cargar el PDF!!!:", e);
      return { resultado: 3, clases: [] };
    }
  }
}
