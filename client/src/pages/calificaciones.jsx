import React, { useContext, useState, useEffect } from "react";
import { NavContext } from "../layouts/layoutProfesor";
import ModalCalificaciones from "../components/modalCalificaciones";
import { updateCalificacion } from "../services/calificacion.api"
import { getCalificacionesByEntrega } from "../services/calificacion.api";

import axios from "axios";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Input, Card, CardBody, Button, useDisclosure } from "@nextui-org/react";
import { IoIosArrowBack } from 'react-icons/io';
import toast from 'react-hot-toast';

const Calificaciones = ({nrc, entrega, mostrarVistaEntregas}) => {

  const { showNav, shownav } = useContext(NavContext);
  const controlModal = useDisclosure();


  const [archivoCalificaciones, setArchivoCalificaciones] = useState({"datos":"", "tipo":0});
  const [calificaciones, setCalificaciones] = useState(null);
  const [calificacionesExtraidas, setCalificacionesExtraidas] = useState([]);
  const [calificacionesCargadas, setCalificacionesCargadas] = useState(false);
  const [mostrarCalificacionesExtraidas, setMostrarCalificacionesExtraidas] = useState(false)
  const [editarCalificaciones, setEditarCalificaciones] = useState(false);
  const [ guardarCalificaciones, setGuardarCalificaciones ] = useState(false);
 
  const ordenAlfabetico = (alumnoA, alumnoB) => {
   let nombreAlumnoA = alumnoA.alumno_detail.apellidos + " " + alumnoA.alumno_detail.nombre;
   let nombreAlumnoB = alumnoB.alumno_detail.apellidos + " " + alumnoB.alumno_detail.nombre;
   if( nombreAlumnoA < nombreAlumnoB)
    return -1;
   else if( nombreAlumnoA > nombreAlumnoB)
    return 1;
   else
    return 0;

  } 

  const ordenAlfabeticoB = (alumnoA, alumnoB) => {
    //let nombreAlumnoA = alumnoA.alumno_detail.apellidos + " " + alumnoA.alumno_detail.nombre;
    //let nombreAlumnoB = alumnoB.alumno_detail.apellidos + " " + alumnoB.alumno_detail.nombre;
    if( alumnoA.nombre < alumnoB.nombre)
     return -1;
    else if( alumnoA.nombre > alumnoB.nombre)
     return 1;
    else
     return 0;
 
   } 
   
  useEffect(() => {

    const obtenerCalificaciones = async () => {
     try{
      let toastCargando = toast.loading("Cargando calificaciones...");
      let res = await getCalificacionesByEntrega(entrega.id);
      //console.log(res)
      setCalificaciones(res.data.sort(ordenAlfabetico));
      toast.dismiss(toastCargando);
      toast.success("¡Calificaciones obtenidas correctamente!");
      setCalificacionesCargadas(true)
     // console.log(res)
     }catch(e){
      toast.error("¡Ha ocurrido un problema al intentar cargar las calificaciones!, intente volver a la seccion mas tarde.")
     }
    }

    obtenerCalificaciones();
    //console.log(getCalificacionesByEntrega(entrega.id)); 
  }, [guardarCalificaciones])

  const modificarCalificacion = (id_calificacion, valor) =>{
    if(valor<=10)
    {
     console.log("Valor:"+ valor)
     let auxCalificaciones = [...calificaciones];
     let posicionCalificacion = calificaciones.findIndex( (c) => c.id==id_calificacion)
    // console.log(auxCalificaciones[posicionCalificacion]);

     auxCalificaciones[posicionCalificacion].nota = valor==""?0:parseFloat(valor);
     setCalificaciones(auxCalificaciones);
     setEditarCalificaciones(true);
   //  setGuardarCalificaciones(true);
    }
  }
    

  

  //const nrc = "59069";

  //
  // ----------------------------------------------------
  // --- Estados de la variable 'resultadoExtraccion' ---
  // ----------------------------------------------------
  //
  // 0 => Indica que la extraccion se realizo correctamente.
  //
  // 1 => Indica que el archivo esta vacio
  //
  // 2 => Indica que el Excel tiene una estructura interna invalida.
  //
  // 3 => Indica que se ha seleccionado un archivo con un tipo diferente a Excel
  //
  // 4 => Indica que se intentando comenzar con el proceso de lectura del Excel sin tener algun archivo seleccionado.
  //
  const [resultadoExtraccion, setResultadoExtraccion] = useState(-1);

  // Esta variable contiene los mensajes que aparecen en cada uno de los posibles escenarios identificados hasta el momento.
  const mensajesImportacionExcel = ["¡Se han extraido los datos del Excel exitosamente!",
                               "¡¡¡El archivo Excel esta vacio!!!",
                               "¡¡¡La estructura del documento no es valida!!!",
                               "¡¡¡El tipo de archivo no es valido!!!",
                               "¡Seleccione primero un archivo!",
                                 
                              ];
                              
  //
  // ---------------------------------------------------------------------------------
  //  Esta funcion detecta cuando se ha seleccionado un archivo mediante el formulario
  // ---------------------------------------------------------------------------------
  //
  const manejarArchivo = (e) =>{
    let archivoSeleccionado = e.target.files[0];

    if (archivoSeleccionado) {
      let tipoArchivo = archivoSeleccionado.type;
      console.log(tipoArchivo);
      if (tipoArchivo === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") { // Validar que sea un archivo PDF
        let leerArchivo = new FileReader();
        leerArchivo.readAsArrayBuffer(archivoSeleccionado);
        leerArchivo.onload = (e) => {
          setArchivoCalificaciones({"datos":e.target.result,"tipo":1});
        };
      }
      else if(tipoArchivo === "text/csv")
      {
       Papa.parse(archivoSeleccionado, {
        complete: (res) => {
         setArchivoCalificaciones({"datos":res,"tipo":2});
        }
       })
       //setArchivoCalificaciones()
      }
      else
      {
       setResultadoExtraccion(3);
      } 

    }
  }

  
  //
  // ---------------------------------------------------------------------------------------------------------
  //  Esta funcion permite crear un arreglo de objetos (JSON) con las calificaciones encontradas dentro del 
  //  archivo de Excel que genera Teams para poder almacenarlas posteriormente en la base de datos.
  // ---------------------------------------------------------------------------------------------------------
  //

  const crearListaCalificaciones = async ( datosCalificaciones, posicionIdentificador, posicionNota, notaMaxima) => {
    let calificacionesEncontradas = [];
    let correo = "";
    let inscripciones = await axios.get("http://127.0.0.1:8000/api/Inscripcion/?search="+nrc);
    let listaAlumnos = inscripciones.data.map( (inscripcion) => inscripcion.alumno_detail);
    console.log(inscripciones)
    for(let d of datosCalificaciones)
    {
     let datosAlumno;
    // console.log(d)
      if(archivoCalificaciones.tipo == 1)
      {
       correo = d.split(">")[posicionIdentificador.correo];
       datosAlumno = listaAlumnos.find( (alumno) => alumno.correo == correo)
      }
      else
      {
       
       let identificador = d.split(">")[posicionIdentificador.apellidos] + d.split(">")[posicionIdentificador.nombre]
      // console.log("Apellidos:"+posicionIdentificador.apellidos+", Nombre:"+posicionIdentificador.nombre);
       datosAlumno = listaAlumnos.find( (alumno) => (alumno.apellidos + alumno.nombre) == identificador)
       
      }
      if(datosAlumno)
      {
       let nota = (parseFloat(d.split(">")[posicionNota]) * 10.0) / notaMaxima;
      // console.log(datosAlumno.nombre) 
       if(isNaN(nota))
        nota=0;
       let calificacion = {
        "nota": nota,
        "nombre": datosAlumno.apellidos + " " +datosAlumno.nombre,
        "matricula": datosAlumno.matricula,
        "id_entrega": entrega.id
       };
       calificacionesEncontradas.push(calificacion);
     //  console.log(calificacion)
      }
    }
    if(calificacionesEncontradas.length==listaAlumnos.length)
    {
     setGuardarCalificaciones(true);
    }
    else
    {
      toast.error("¡Parece que hay un problema!, verifique que el archivo seleccionado contenga las calificaciones de todos los alumnos inscritos en esta clase.",{"duration":8000});
    }
     

    setCalificacionesExtraidas(calificacionesEncontradas.sort(ordenAlfabeticoB));
    console.log(calificacionesEncontradas);

   }


   
   const actualizarCalificaciones = async () => {

    try{
    let promesas;
    let toastActualizar = toast.loading("Guardando cambios...");

    if(mostrarCalificacionesExtraidas)
    {
    // for(let calificacion of calificacionesExtraidas )
    // {
      promesas = calificacionesExtraidas.map( calificacion => {
        let datosCalificacion = calificaciones.find( (c) => c.matricula == calificacion.matricula);
       // console.log("Datos calificaciones encontradas:")
       // console.log(datosCalificacion)
        return updateCalificacion(datosCalificacion.id, calificacion);
       }
      );
     //}
    }
    else
    {
     //for(let calificacion of calificaciones)
     //{
     promesas = calificaciones.map( calificacion => updateCalificacion(calificacion.id, calificacion));
     //}
    }

    await Promise.all(promesas);
    toast.dismiss(toastActualizar);
    toast.success("¡Se han actualizado las calificaciones exitosamente!");
    setMostrarCalificacionesExtraidas(false);
    setEditarCalificaciones(false);
    setGuardarCalificaciones(false);
    }catch(e){
     toast.error("¡Ha ocurrido un problema al intentar actualizar las calificaciones!, vuelva a pulsar el boton para reintarlo.")
    }
   }

  const validarNombreEntrega = (contenidoArchivo) => {
   return contenidoArchivo.includes(entrega.nombre);
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

  //
  // --------------------------------------------------------
  //  Funcion que permite la extraccion de los datos del Excel
  // --------------------------------------------------------
  //
  const leerArchivoCalificaciones = async (e) =>{
    //e.preventDefault();
    console.log("l")
    if(archivoCalificaciones!=null)
    { //Se verifica si el usuario ha seleccionado el archivo Excel.
      if(archivoCalificaciones.tipo == 1)
      {
       const workbook =  XLSX.read(archivoCalificaciones.datos, {type: 'buffer'});
       const worksheetName =  workbook.SheetNames[0];
       const worksheet =  workbook.Sheets[worksheetName];
       console.log(worksheet);
       console.log(XLSX.utils.sheet_to_csv(worksheet, {RS:"#"}))
       const excelValido = validarEstructuraCalificaciones(XLSX.utils.sheet_to_csv(worksheet));
       const existeNombreEntrega = validarNombreEntrega(XLSX.utils.sheet_to_txt(worksheet));
       if(!excelValido)
       {
        setResultadoExtraccion(2);
       }
       else if(!existeNombreEntrega)
       {
        toast.error("¡El nombre de la entrega no coincide con alguna de las entregas que se encuentran dentro del archivo!")
       }
       else
       {
        let archivoEditado = false;
        let datosCalificaciones =  XLSX.utils.sheet_to_csv(worksheet, {RS:"&&", FS:">"});
        let auxCalificaciones = datosCalificaciones.split("&&").filter( (fila) => fila.search(/[\d\w]/g)!= -1);
        if(auxCalificaciones[0].toString().includes("Datos de")==true)
        {
         archivoEditado = true;
        }
        auxCalificaciones.shift();
        let posicionIdentificador = {
         "correo": archivoEditado?6:3
        };
        let posicionNota = archivoEditado?12:9;
        let posicionNotaMaxima = archivoEditado?13:10;
        let notaMaxima = auxCalificaciones[1].split(">")[posicionNotaMaxima];
        if(archivoEditado)
        {
         auxCalificaciones.shift();
        }
        //auxCalificaciones.shift();
        crearListaCalificaciones(auxCalificaciones,posicionIdentificador,posicionNota,notaMaxima);
        setMostrarCalificacionesExtraidas(true);

        toast.success("¡Se han extraido los datos exitosamente!");
        setResultadoExtraccion(0); //Se indica que el proceso de extraccion se realizo correctamente.
       }
      }
      else
      {
       let contenidoArchivoCSV = Papa.unparse(archivoCalificaciones.datos)
       let archivoValido = validarEstructuraCalificaciones(contenidoArchivoCSV);
       let existeNombreEntrega = validarNombreEntrega(contenidoArchivoCSV);
       
       if(!archivoValido)
       {
        setResultadoExtraccion(2);
       }
       else if(!existeNombreEntrega)
       {
        toast.error("¡Calificaciones no encontradas!, verifica que el nombre de la entrega se igual a la que se encuentra en el archivo."); 
       }
       else
       {
        let posicionIdentificador = {
         "nombre": archivoCalificaciones.datos.data[0].findIndex( (columna) => columna=="Nombre"),
         "apellidos": archivoCalificaciones.datos.data[0].findIndex( (columna) => columna=="Apellidos")
        }

        let posicionNota = archivoCalificaciones.datos.data[0].findIndex( (columna) => columna==entrega.nombre);
        let notaMaxima = archivoCalificaciones.datos.data[2][posicionNota];
        //let fecha = archivoCalificaciones.datos.data[1][posicionNota];
        let auxCalificaciones = Papa.unparse(archivoCalificaciones.datos, {newline:"#"}).replace("�","Ñ").split("#");
        console.log("Papaparse")
        console.log(auxCalificaciones)
        crearListaCalificaciones(auxCalificaciones,posicionIdentificador, posicionNota,notaMaxima);
        setMostrarCalificacionesExtraidas(true);
        toast.success("¡Se han extraido los datos exitosamente!");
   
       }
      }
    }
    else
    { //Si el usuario aun no ha seleccionado algun archivo, se asignara un valor igual a 4 al estado "resultadoExtraccion".
     setResultadoExtraccion(4);
    }
   }


   



  return (
    <>

     <Button onClick={ () => { if(editarCalificaciones || mostrarCalificacionesExtraidas) {setEditarCalificaciones(false);setMostrarCalificacionesExtraidas(false); setGuardarCalificaciones(false)} else {mostrarVistaEntregas()}}} variant="faded" radius="large" startContent={<IoIosArrowBack size="23px"/>} className="text-base px-4"> { (editarCalificaciones || mostrarCalificacionesExtraidas)?"Regresar a calificaciones":"Regresar a entregas"}</Button>
    <div className="flex">

    {
      !editarCalificaciones && !mostrarCalificacionesExtraidas &&
      (
       <>
       <div className="w-2/4">
       <h2 className="text-3xl font-semibold mt-5">Calificaciones para {entrega.nombre}</h2>
       </div>
       <div className="flex w-2/4 justify-end">
                    <Button
                        isDisabled={!calificacionesCargadas}
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-3 mr-3 mb-10 font-bold text-base"
                        onClick={ () => {setEditarCalificaciones(true); setGuardarCalificaciones(true);}}
                    >
                        <i className="pi pi-pencil" style={{fontSize:"18px",fontWeight:"bold"}}></i> Modificar calificaciones
                    </Button>

                    <Button
                        isDisabled={!calificacionesCargadas}
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-0 mb-10 font-bold text-base"
                        onClick={controlModal.onOpen}
                    >
                        <i className="pi pi-folder-open" style={{fontSize:"18px",fontWeight:"bold"}}></i> { mostrarCalificacionesExtraidas?"Cambiar archivo":"Importar calificaciones"}
                    </Button>

       </div>
      </>
      )
                    
    }

                    {
                     (editarCalificaciones || mostrarCalificacionesExtraidas) &&
                     (
                      <div className="flex justify-between w-full">
                      <Button
                      radius="large"

                      className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-0 mb-10 font-bold text-base"
                      onClick={controlModal.onOpen}
                      >
                      <i className="pi pi-folder-open" style={{fontSize:"18px",fontWeight:"bold"}}></i> { mostrarCalificacionesExtraidas?"Cambiar archivo":"Importar calificaciones"}
                  </Button>


                      
                      <Button

                        isDisabled={guardarCalificaciones?false:true}
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-3 mb-10 font-bold text-base"
                        onClick={actualizarCalificaciones}
                     >
                        <i className="pi pi-save" style={{fontSize:"18px",fontWeight:"bold"}}></i> Guardar calificaciones
                    </Button>
                    </div>
                     )
                    }

    </div>
    {
     mostrarCalificacionesExtraidas
     ? 
     (
      <>
      <h2 className="text-3xl font-semibold mb-2">Resumen de la extraccion</h2>
      <hr></hr>
      <h2 className="text-2xl my-3">Numero de calificaciones identificadas: {calificacionesExtraidas.length}</h2>
      <h2 className="text-2xl my-3">Numero de calificaciones no encontradas: {calificaciones.length - calificacionesExtraidas.length}</h2>
      <hr></hr>
      <br></br>
      <table style={{width:"100%"}}>
      <thead>
        <tr>
          <th className="text-2xl text-start pl-3">Nombre</th>
          <th className="text-2xl py-3">Matricula</th>
          <th className="text-2xl py-3">Nota</th>
        </tr>
      </thead>
      <tbody>
      {

      calificacionesExtraidas.map( (calificacion, index) => (
      <tr key={index} style={{border:"2px solid"}} className="hover:bg-blue-800">
       <td className="text-xl text-start py-3 pl-3"> {calificacion.nombre} </td>
       <td className="text-xl text-center py-3"> {calificacion.matricula} </td>
       <td className="text-xl font-semibold text-center py-3"> {calificacion.nota}</td>      
      </tr>
      ))
      
      }
      </tbody>
      </table>
      <br></br>

      </>
     )
     :

     (
      <>
      <table style={{width:"100%", borderCollapse:"collapse", border:"3px solid white"}}>
       <thead>
        <tr className="text-left" style={{border:"3px solid white"}}>
          <th className="text-2xl py-3 pl-3">Nombre</th>
          <th className="text-2xl py-3">Matricula</th>
          <th className="text-2xl py-3">Nota</th>
          <th className="text-2xl py-3">Nota redondeada</th>
        </tr>
       </thead>
       <tbody>

    {
     calificaciones?.map( (calificacion, index) => (
      
    <tr key={calificacion.id} className="text-start hover:bg-blue-800" style={{border:"3px solid grey"}}>
     <td className="text-xl py-3 pl-3"> {calificacion.alumno_detail.apellidos + " "+ calificacion.alumno_detail.nombre} </td>
     <td className="text-xl py-3"> {calificacion.matricula} </td>
      
     { editarCalificaciones?

      (
      <>
        <Input classNames={{input: ["text-xl font-semibold text-end"]}}  type="number" max={10} min={0} step={0.1} onChange={ (e) => {modificarCalificacion(calificacion.id, e.target.value)}} endContent={"%"} value={calificacion.nota}></Input>
      </>
      )
      :
      (
       <>
        <td className="text-xl py-3"> {calificacion.nota} </td>
        <td className="text-xl py-3"> {Math.round(calificacion.nota)} </td>  
       </>
      )
     }

    </tr>
    )
    )
    }
     </tbody>
    </table>
    </>
    )
   }

   <ModalCalificaciones controlModal={controlModal} setMostrarCalificacionesExtraidas={setMostrarCalificacionesExtraidas} manejarArchivo={manejarArchivo} setArchivoCalificaciones={setArchivoCalificaciones} leerArchivoCalificaciones={leerArchivoCalificaciones}></ModalCalificaciones>
   </>
  )
}

export default Calificaciones;