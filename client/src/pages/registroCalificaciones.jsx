import React, { useContext, useState,  useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, useDisclosure, Button, Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import {  Dropdown,  DropdownTrigger,  DropdownMenu,  DropdownSection,  DropdownItem} from "@nextui-org/dropdown";
import { NavContext } from "../layouts/layoutProfesor";
import * as XLSX from "xlsx";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable";
import { claseContext } from "../layouts/layoutProfesor";
import Calificaciones from "./calificaciones"
import ModalEntregas from "../components/modalEntregas";
import ModalImportarEntrega from "../components/modalImportarEntrega";
import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { getCalificacionesByNRC } from "../services/calificacion.api"
import { manejarArchivo, leerArchivoEntrega } from "../services/importacion"
import { getEntregasByNRC } from "../services/entrega.api"
import { getCriteriosByNRC } from "../services/claseCriterio.api";



import { Input } from "@nextui-org/react";
import toast from 'react-hot-toast';
import { FiEdit2 } from 'react-icons/fi';
import { IoIosArrowBack } from 'react-icons/io';
import { GrNext } from "react-icons/gr";
import { MdDownload } from "react-icons/md";





const RegistroCalificaciones = ({controlModal, entregasExistentes}) => {

  const { showNav, shownav } = useContext(NavContext);
  const { dataClase } = useContext(claseContext);
  
  const [ archivoEntrega, setArchivoEntrega ] = useState(null);
  const [ alumnos, setAlumnos ] = useState([]);
  const [ entregas, setEntregas ] = useState([]);
  const [ criterios, setCriterios ] = useState([]);
  const [ calificaciones, setCalificaciones ] = useState([])
  const [ camposTabla, setCamposTabla ] = useState([])

  const [ entregaExtraida, setEntregaExtraida ] = useState(null)
  const [ entregaSeleccionada, setEntregaSeleccionada ] = useState(null);
  const [ calificacionesExtraidas, setCalificacionesExtraidas ] = useState(null);

  const [ mostrarEntregas, setMostrarEntregas ] = useState(false);
  const [ mostrarCalificaciones, setMostrarCalificaciones ] = useState(false);
  const [ mostrarEntregaExtraida, setMostrarEntregaExtraida ] = useState(false);
  const [ editarEntregaExtraida, setEditarEntregaExtraida ] = useState(false);  
  const [ editarEntregas, setEditarEntregas ] = useState(false);

  const cargarCalificaciones = async () => {
   const respuesta = await getCalificacionesByNRC(dataClase.nrc);
   return respuesta.data;
  }

  const cargarCriterios = async () => {
   const respuesta = await getCriteriosByNRC(dataClase.nrc);
   return respuesta.data; 
  }

  const cargarEntregas = async () => {
    let respuesta = await getEntregasByNRC(dataClase.nrc);
    if(respuesta.data.length>0)
    {
     let listaEntregas = respuesta.data.filter( entrega => entrega.estado=="REGISTRADA")
     //console.log(listaEntregas)
     return listaEntregas;
    }
    else
    {
     return [];
    }
  }

   const obtenerAlumnos = async () => {
     const inscripciones = await obtenerListaAlumnos(dataClase.nrc);
     const listaAlumnos = inscripciones.map( (inscripcion) => inscripcion.alumno_detail);
     return listaAlumnos;
    }
    
   const ordenarEntregasPorTipo = (listaEntregas, listaCriterios) => {
    let entregasOrdenadas = []
    let auxEntregas;
    for(let criterio of listaCriterios)
    {
     auxEntregas = listaEntregas.filter( (entrega) => entrega.tipo == criterio.id);
     entregasOrdenadas.push(auxEntregas);
    }
    return entregasOrdenadas;
   }

  
   
   const ordenarCalificacionesPorAlumno = (listaCalificaciones, listaAlumnos) => {
    let calificacionesPorAlumno = {}
    for(let alumno of listaAlumnos)
    {
     let auxCalificaciones = listaCalificaciones.filter( (calificacion) => calificacion.matricula == alumno.matricula)
     calificacionesPorAlumno[alumno.matricula] = auxCalificaciones;
    }
   // console.log(calificacionesPorAlumno)
    return calificacionesPorAlumno;
   }

   const ordenAlfabeticoAlumno = (a,b) => {
    let alumnoA = a.apellidos.toUpperCase();
    let alumnoB = b.apellidos.toUpperCase();
    
    if(alumnoA < alumnoB)
    {
     return -1;
    }
    else if(alumnoA > alumnoB)
    {
     return 1;
    }
    else
     return 0;

   }

   const ordenAlfabetico = (a,b) =>{
    let entregaA = a.entrega_detail.nombre.toUpperCase();
    let entregaB = b.entrega_detail.nombre.toUpperCase();
    
    if(entregaA < entregaB)
    {
     return -1;
    }
    else if(entregaA > entregaB)
    {
     return 1;
    }
    else
     return 0;
   }

   const filtrarCalificacionesAlumnosPorTipo = (listaCalificaciones, listaAlumnos, listaCriterios) =>
   {
    let auxAlumnos = [...listaAlumnos];
    let auxCalificaciones;
    let calificacionesAlumno = [];
    for(let alumno of auxAlumnos)
    {
     calificacionesAlumno = []
     for(let criterio of listaCriterios)
     {
      auxCalificaciones = listaCalificaciones[alumno.matricula].filter( (calificacion) => calificacion.entrega_detail.tipo==criterio.id)
      auxCalificaciones.sort(ordenAlfabetico);
      calificacionesAlumno.push(auxCalificaciones);
     }
     alumno["calificacionesPorTipo"] = calificacionesAlumno;
    } 
   // console.log(auxAlumnos)
    return auxAlumnos;
   }

   const obtenerCalificacionActa = (calificacion) => Math.round(calificacion)>=6?Math.round(calificacion):5;

   const obtenerCalificacionFinal = (calificacion) => Math.round(calificacion);

   const obtenerCalificacionesParciales = (listaAlumnos, listaCriterios) => {
    let auxAlumnos = [...listaAlumnos];
    let calificacionAlumno = 0;
    let calificacionCriterio = 0;
    let ponderacionCriterio = 0;
    let numeroEntregas = 0;
    let sumaEntregas = 0;
    for(let alumno of auxAlumnos)
    {
     calificacionAlumno = 0;
     for(let k=0; k<listaCriterios.length;k++)
     {
      numeroEntregas = alumno.calificacionesPorTipo[k].length;
      ponderacionCriterio = listaCriterios[k].ponderacion; 
      sumaEntregas = alumno.calificacionesPorTipo[k].reduce( (valorPrevio, elementoActual) => valorPrevio+ Math.round( elementoActual.nota),0)
      if(sumaEntregas>0)
       calificacionCriterio = (sumaEntregas * ponderacionCriterio)/(numeroEntregas*10)
      else
       calificacionCriterio = 0;
      calificacionAlumno += calificacionCriterio;
    //  console.log("Alumno:"+alumno.nombre+", Suma:"+ parseFloat(calificacionAlumno))
     }
    // console.log("Calificacion Parcial:")
    // console.log(calificacionAlumno)
     alumno["calificacion"] = calificacionAlumno / 10;      
    }
   // console.log(auxAlumnos)
   }

    const obtenerNombresCamposTabla = (listaEntregas) => {
     let nombresCampos = ["Alumno","Matricula"]
     let auxNombresCampos;
     for(let entrega of listaEntregas)
     {
      auxNombresCampos = entrega.map( (e) => e.nombre).toSorted();
     // console.log(auxNombresCampos)
      if(auxNombresCampos.length>0)
       nombresCampos.push(...auxNombresCampos);
      else
       nombresCampos.push("N/A"); 
     }
    // console.log(nombresCampos);
     return nombresCampos;
    }

    const cargarDatosTabla = async () => {
     let listaAlumnos = await obtenerAlumnos();
     let listaEntregas = await cargarEntregas();
     let listaCriterios = await cargarCriterios();
     let listaCalificaciones = await cargarCalificaciones();
     let listaCalificacionesFiltradas = listaCalificaciones.filter( c => c.entrega_detail.estado == "REGISTRADA")

     let entregasPorTipo = ordenarEntregasPorTipo(listaEntregas, listaCriterios);
     let nombreCampos = obtenerNombresCamposTabla(entregasPorTipo);
     nombreCampos.push("Calificacion")
     nombreCampos.push("Final")
     nombreCampos.push("Acta");
     let calificacionesPorAlumno = ordenarCalificacionesPorAlumno(listaCalificacionesFiltradas, listaAlumnos);
     //console.log("Calificaciones por alumno:")
     //console.log(calificacionesPorAlumno);
     listaAlumnos = filtrarCalificacionesAlumnosPorTipo(calificacionesPorAlumno, listaAlumnos, listaCriterios)
     obtenerCalificacionesParciales(listaAlumnos, listaCriterios);
     setEntregas(entregasPorTipo)
     setCriterios(listaCriterios);
     setCamposTabla(nombreCampos)
     setAlumnos(listaAlumnos.toSorted(ordenAlfabeticoAlumno))
    }


    useEffect(() => {


        //console.log(dataClase.nrc);

        cargarDatosTabla();

        //showNav();
    }, [entregasExistentes])
    
    console.log(shownav)

    const generarListaFinalArreglo = () => {     
      let listaFinalArreglo = []
      listaFinalArreglo = alumnos.map( (alumno, indice) => [alumno.apellidos+" "+alumno.nombre,alumno.matricula, obtenerCalificacionActa(alumno.calificacion)]);
      return listaFinalArreglo;
    }

    const generarListaFinalJSON = () => {
     let listaFinalJSON = []
     let auxCalificaciones = {
      "nombre":"",
      "matricula":"",
      "calificacion":"",
     }

     listaFinalJSON = alumnos.map( (alumno, indice) => ({"Nombre":alumno.apellidos+" "+alumno.nombre,"Matricula":alumno.matricula,"Calificacion": obtenerCalificacionActa(alumno.calificacion)}));
     return listaFinalJSON;
    }

    const exportarListaFinalPDF = () => {
     const pdf = new jsPDF();
     const tituloPDF = "Lista de Calificaciones Finales\n"
     const subtitulosPDF = "Docente: "+dataClase.profesor_detail.nombre+" \nNRC: "+dataClase.nrc 
     const datosTabla = generarListaFinalArreglo();
     console.log(datosTabla);
     pdf.setFontSize(19);
     pdf.text(tituloPDF, 14 , 20)
     pdf.setFontSize(12)
     pdf.text(subtitulosPDF,14,27)
     autoTable(pdf, {
      startY: 40,
      head: [["Nombre del Alumno","Matricula","Calificacion"]],
      body: datosTabla
     })
     pdf.save("Calificaciones finales.pdf")
    } 

    const exportarListaFinalExcel = () => {
     let listaFinalJSON = generarListaFinalJSON();
     console.log(listaFinalJSON)
     let workbook = XLSX.utils.book_new();
     let worksheet = XLSX.utils.json_to_sheet(listaFinalJSON)
     console.log(worksheet)
     XLSX.utils.book_append_sheet(workbook, worksheet, "Lista final");
     worksheet["!cols"]  = [{wch:40},{wch:15},{wch:15}];
     XLSX.writeFile(workbook,"Calificaciones finales.xlsx");
    }

  return (
    <>
    
    <Modal isDismissable={false} size={"full"} classNames={{closeButton:"text-foreground-white text-2xl hover:bg-black active:text-black"}} isOpen={controlModal.isOpen} onOpenChange={controlModal.onOpenChange} >
    <ModalContent>
    {
     (onClose) => (
      <>
       <ModalHeader className="bg-gradient-to-tr from-primary-100 to-primary-200 text-2xl text-white font-bold">

        Registro de calificaciones
       </ModalHeader>

      <ModalBody className="overflow-x-scroll bg-secondary-900 p-0 pb-4 px-4 ">
      <div className="flex justify-between">
      <Button onClick={onClose} variant="faded" radius="large" startContent={<IoIosArrowBack size="23px"/>} className="text-base mt-4">Regresar a entregas</Button>

      <Dropdown>
       <DropdownTrigger>
        <Button  variant="faded" radius="large" startContent={<MdDownload size="23px"/>} className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-4 mr-3 mb-2 font-bold text-base">Descargar lista final</Button>
       </DropdownTrigger>
       <DropdownMenu aria-label="Acciones estaticas" variant="faded">
        <DropdownItem key="excel" onPress={exportarListaFinalExcel} className="text-black">Formato Excel</DropdownItem>
        <DropdownItem key="pdf" onPress={exportarListaFinalPDF} className="text-black">Formato PDF</DropdownItem>
       </DropdownMenu>
      </Dropdown>
      </div>
      <table className="border-separate border-spacing-0 " >
      <thead className="sticky top-0 bg-black mt-0 ">
       <tr>
        <th className="bg-secondary-900 "></th>
        <th className="bg-secondary-900"></th>
        {
         criterios.map( (criterio, index) => (
          <th key={index} className="py-1 border-2" colSpan={entregas[index].length}> {criterio.ponderacion}%</th>
         ))
        }
        <th className="bg-secondary-900"></th>
        <th className="bg-secondary-900"></th>
        <th className="bg-secondary-900"></th>
       </tr>
    
       <tr>
        <th className="bg-secondary-900"></th>
        <th className="bg-secondary-900"></th>
        {
         criterios.map( (criterio, index) => (
          <th key={index} className="p-1 border-2" colSpan={entregas[index].length}> {criterio.criterio_detail.nombre}</th>
         ))
        }
        <th className="bg-secondary-900"></th>
        <th className="bg-secondary-900"></th>
        <th className="bg-secondary-900"></th>
       </tr>

       <tr>
       {
        camposTabla.map( (campo, index) => (
          <th key={index} className="p-3" style={{border:"2px solid white"}}>{campo}</th>
         )
        )
       }
       </tr>
      </thead>
      <tbody>
      {
       alumnos.map( (alumno, index) => (
       <tr key={index} className="hover:bg-blue-800">
        <td className="p-2" style={{border:"1px solid white"}}>{alumno.apellidos +" "+ alumno.nombre +" "}</td>
        <td className="p-2" style={{border:"1px solid white"}}>{alumno.matricula}</td>
        {
         alumno.calificacionesPorTipo.map( (tipoCalificacion) => tipoCalificacion.length==0?(<td key="99" className="text-center" style={{border:"1px solid white"}}>N/A</td>):tipoCalificacion.map( (calificacion, index) => (
          <td key={index} className="text-center" style={{border:"1px solid white"}}> { Math.round(calificacion.nota)}</td>
          )
         )
        )
        }
        <td className="p-2" style={{border:"1px solid white"}}> {alumno.calificacion}</td>
        <td className="p-2 text-center" style={{border:"1px solid white"}}> {Math.round(alumno.calificacion)}</td>
        <td className="p-2 text-center" style={{border:"1px solid white"}}> {Math.round(alumno.calificacion)>=6?Math.round(alumno.calificacion):"5"}</td>

       </tr>
       )
      )
      }
      </tbody>
      </table>
      </ModalBody>
      </>
      )
      }
      </ModalContent>
      </Modal>
      </>
)
}

export default RegistroCalificaciones;

