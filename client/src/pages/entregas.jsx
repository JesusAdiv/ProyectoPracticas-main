import React, { useContext, useState,  useEffect } from "react";
import { NavContext } from "../layouts/layoutProfesor";
import { claseContext } from "../layouts/layoutProfesor";
import Calificaciones from "./calificaciones";
import RegistroCalificaciones from "./registroCalificaciones";
import ErrorCarga from "../components/errorCarga";
import ModalEntregas from "../components/modalEntregas";
import ModalImportarEntrega from "../components/modalImportarEntrega";
import ModalBorrarEntrega from "../components/modalBorrarEntrega";

import { manejarArchivo, leerArchivoEntrega } from "../services/importacion"
import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { createEntrega, getEntregasByNRC, updateEntrega, deleteEntrega } from "../services/entrega.api"
import { getCriteriosByNRC } from "../services/claseCriterio.api";
import { createCalificacion, getCalificacionesByEntrega, updateCalificacion } from "../services/calificacion.api"


import { Link } from "react-router-dom";
import { Input, Card, CardBody, Button, useDisclosure } from "@nextui-org/react";
import toast from 'react-hot-toast';
import { FiEdit2 } from 'react-icons/fi';
import { IoIosArrowBack } from 'react-icons/io'
import { GrNext } from "react-icons/gr";
import { RiFileList3Line } from "react-icons/ri";
import { MdDelete } from "react-icons/md"




const Entregas = () => {

  const { showNav, shownav } = useContext(NavContext);
  const { dataClase } = useContext(claseContext);
  const controlModal = useDisclosure();
  const controlModalImportacion = useDisclosure();
  const controlModalBorrar = useDisclosure();
  const controlModalRegistro = useDisclosure();
  
  const [ archivoEntrega, setArchivoEntrega ] = useState(null);
  const [ entregas, setEntregas ] = useState([]);
  const [ entregasNoRegistradasBD, setEntregasNoRegistradasBD] = useState([])
  const [ entregaExtraida, setEntregaExtraida ] = useState(null)
  const [ entregaSeleccionada, setEntregaSeleccionada ] = useState(null);
  const [ respuestaDelete, setRespuestaDelete ] = useState(null);
  const [ calificacionesExtraidas, setCalificacionesExtraidas ] = useState(null);
  const [ cargando, setCargando ] = useState(true);
  const [ cargaCorrecta, setCargaCorrecta ] = useState(true)

  const [ mostrarEntregas, setMostrarEntregas ] = useState(false);
  const [ mostrarCalificaciones, setMostrarCalificaciones ] = useState(false);
  const [ mostrarReporte, setMostrarReporte ] = useState(false); 
  const [ mostrarEntregaExtraida, setMostrarEntregaExtraida ] = useState(false);
  const [ editarEntregaExtraida, setEditarEntregaExtraida ] = useState(false);  
  const [ editarEntregas, setEditarEntregas ] = useState(false);
  const [ calificacionesCompletas, setCalificacionesCompletas ] = useState(false);

  //var operacionDelete = false;
  
    
    
    const ordenAlfabetico = (entregaA, entregaB) => {
     if(entregaA.nombre < entregaB.nombre)
      return -1;
     else if(entregaA.nombre > entregaB.nombre)
      return 1;
     else
      return 0;
    }

    const cargarEntregas = async () => {
      try
      {
       let listaEntregas = await getEntregasByNRC(dataClase.nrc);
       if(listaEntregas.data.length>0)
       {
        let entregasActivas = listaEntregas.data.filter( (entrega) => entrega.estado=="REGISTRADA");
        let entregasPendientes = listaEntregas.data.filter( (entrega) => entrega.estado=="PENDIENTE");
        setEntregasNoRegistradasBD(entregasPendientes);
        if(entregasActivas.length>0)
        {
         setEntregas(entregasActivas.sort(ordenAlfabetico));
         setMostrarEntregas(true);
        }
        else
         setMostrarEntregas(false);
        
        toast.success("Seccion de entregas",{icon:<i className="pi pi-info-circle text-2xl text-yellow-400 font-semibold"/>, duration:1500})        
       }
       else
        setMostrarEntregas(false);
       setCargando(false);

      } catch(e){
        setCargando(false);
        setCargaCorrecta(false);
        toast.error("¡Se ha presentado un problema al intentar cargar la lista de entregas!")
      }
     }

    
    useEffect(() => {

        showNav();

        cargarEntregas();

    }, [respuestaDelete])
    
    console.log(shownav)

    const eliminarEntrega = () => {
     deleteEntrega(entregaSeleccionada.id).then( (res) => {
      toast.success("¡Se ha eliminado la entrega y sus calificaciones exitosamente!");
      setRespuestaDelete(res);   
     })
     
    }

    const modificarEstadoArchivo = (archivoEntrega) => setArchivoEntrega(archivoEntrega)

    const mostrarVistaEntregas = () => {
     setMostrarCalificaciones(false);
    }

    const mostrarCardModificarEntrega = (id_entrega) => {
      let entrega = entregas.find( (e) => e.id == id_entrega);   
      setEntregaSeleccionada(entrega);
          controlModal.onOpen();
        
    }

    const mostrarCalificacionesEntrega = (id_entrega) => {
     let entrega = entregas.find( (e) => e.id == id_entrega);   
     setEntregaSeleccionada(entrega);
     setMostrarCalificaciones(true);
     //console.log("Entrega: " + entrega + ", "+ mostrarCalificaciones);
    }  


    const extraerDatosArchivoEntrega = (tipo) => {
    
     if( archivoEntrega!=null && tipo!=null)
     {
      controlModalImportacion.onClose();
      leerArchivoEntrega(archivoEntrega, setMostrarEntregaExtraida, setEntregaExtraida,setCalificacionesExtraidas, setCalificacionesCompletas, tipo, dataClase.nrc);
      //setMostrarEntregas(false);
      setMostrarEntregaExtraida(true);
      setEditarEntregaExtraida(true);
      //console.log("Tamaño: "+calificacionesExtraidas.length)
     }
     else
     {
      toast.error("¡Se deben llenar todos los campos para poder crear la entrega!");
     }
    }


    const crearCalificaciones = async (listaAlumnos, entregaCreada) => {

      try{
      let toastCreacion = toast.loading("Registrando la entrega...")

      setEntregas( (listaEntregas) => [...listaEntregas, entregaCreada]);
      let calificacionesBD = await getCalificacionesByEntrega(entregaCreada.id);


      //for(let alumno of listaAlumnos)
      //  {

         let promesas = listaAlumnos.map( alumno => {
            let nota = 0;
            let posicionCalificacion = calificacionesExtraidas.findIndex((c) => c.matricula==alumno.alumno_detail.matricula)

            //console.log(alumno)
            if(posicionCalificacion!=-1)
            {
             //console.log("In if")
             nota = calificacionesExtraidas[posicionCalificacion].nota
            }
            let calificacion = {
             "nota": nota,
             "matricula": alumno.alumno_detail.matricula,
             "id_entrega": entregaCreada.id
            }
            
            let calificacionEncontradaBD = calificacionesBD.find( c => c.matricula==calificacion.matricula );
            if(calificacionEncontradaBD)
            {
             return updateCalificacion(calificacionEncontradaBD.id, calificacion)
            } 
            else
            {
            //console.log(calificacion);
             return createCalificacion(calificacion);
            }
           }
           )
  
         // }
  
         Promise.all(promesas).then( res2 => {
          let entregaActualizada = {
           "nombre": entregaCreada.nombre,
           "tipo": entregaCreada.tipo,
           "fecha": entregaCreada.fecha,
           "estado": "REGISTRADA"
          }
            updateEntrega(entregaCreada.id, entregaActualizada).then( res3 => {
             setEditarEntregaExtraida(false);
             setMostrarEntregaExtraida(false);
             setMostrarEntregas(true);
             toast.dismiss(toastCreacion);
             toast.success("¡Se ha creado la entrega exitosamente!")
            }
           )
          }
          )
         
  
     }catch(e){
      toast.error("¡Ha ocurrido un problema al intentar crear la entrega!, vuelva a pulsar el boton para reintentarlo")
     }
    }

    const crearEntrega = async () => {

    let toastCreacion = toast.loading("Creando entrega...")
    try{

     let listaAlumnos = await obtenerListaAlumnos(dataClase.nrc);
     let entregaEncontradaBD;
     if(entregasNoRegistradasBD.length>0)
      entregaEncontradaBD = entregasNoRegistradasBD.find( e => e.nombre==entregaExtraida)
     
     if(entregaEncontradaBD != undefined)
     {
      crearCalificaciones(listaAlumnos, entregaEncontradaBD)
     }
     else
     {
      createEntrega(entregaExtraida).then(res =>
      {
       setEntregas( (listaEntregas) => [...listaEntregas, res.data]);

      //for(let alumno of listaAlumnos)
      //  {

         let promesas = listaAlumnos.map( alumno => {
          let nota = 0;
          let posicionCalificacion = calificacionesExtraidas.findIndex((c) => c.matricula==alumno.alumno_detail.matricula)
          //console.log(alumno)
          if(posicionCalificacion!=-1)
          {
           //console.log("In if")
           nota = calificacionesExtraidas[posicionCalificacion].nota
          }
          let calificacion = {
           "nota": nota,
           "matricula": alumno.alumno_detail.matricula,
           "id_entrega": res.data.id
          }
    
          //console.log(calificacion);
          return createCalificacion(calificacion);
         }
         )

       // }

        Promise.all(promesas).then( res2 => {
         let entregaActualizada = {
          "nombre": res.data.nombre,
          "tipo": res.data.tipo,
          "fecha": res.data.fecha,
          "estado": "REGISTRADA"
         }
         updateEntrega(res.data.id, entregaActualizada).then( res3 => {
           setEditarEntregaExtraida(false);
           setMostrarEntregaExtraida(false);
           setMostrarEntregas(true);
           toast.dismiss(toastCreacion)
           toast.success("¡Se ha creado la entrega exitosamente!")
          }
         )
        }
        )
       
    }
     )

     
     }

    }catch(e){
     toast.error("¡Parece que ha ocurrido un problema al crear la entrega!, vuelva a pulsar el boton para reintentarlo")
    }
    }
  
  return (
    <>

    {
     !mostrarCalificaciones?

     (
     <>
    {
     !cargaCorrecta?
     (
      <ErrorCarga mensajeError="Parece que ha ocurrido un problema al intentar cargar la lista de entregas" reintentarCarga={cargarEntregas}/>
     )
     :
     cargando?
     (<div className="flex flex-col items-center justify-center">
       <h2 className="text-3xl font-bold mt-10 pt-4">Cargando entregas</h2>
       <i className="pi pi-sync pi-spin mt-6 text-3xl"></i>
      </div>
     )
     :
     (
      <>
    {
     (!mostrarEntregas && !mostrarEntregaExtraida)?
     (
      <div className="flex flex-col items-center justify-start min-h-full">
      <div className="flex flex-col items-center justify-center">
          <h1 className="text-center text-3xl font-bold mt-6 mb-6">Parece que aun no hay ninguna entrega para esta clase.</h1>
          <h2 className="text-2xl font-medium">Comience con alguna de las siguientes opciones:</h2>
          <div>
          <Button
              radius="large"
              className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-8 mr-3 mb-10 font-bold text-base"
              onClick={controlModal.onOpen}
          >
              <i className="pi pi-plus" style={{fontSize:"16px",fontWeight:"bold"}}></i> Crear entrega
          </Button>

           <Button
              radius="large"
              className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-8 mr-3 mb-2 font-bold text-base"
              onClick={controlModalImportacion.onOpen} >
              <i className="pi pi-file-import" style={{fontSize:"20px",fontWeight:"semibold"}}></i> Importar entrega
           </Button>
          </div>


      </div>
      </div>
     )
      :
      !mostrarEntregaExtraida? 
      (
       <>
       <div className="flex justify-between">
       <h2 className="text-3xl font-semibold ml-8 mt-5 mb-9">{editarEntregas?(<> <FiEdit2 className="inline mr-3"/><span>Editar</span></>):"Entregas"}</h2>
       <div>
          {
           !editarEntregas &&
           (
           <>

           <Button
              radius="large"
              className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-2 mr-3 mb-9 font-bold text-base"
              onClick={controlModal.onOpen} >
              <i className="pi pi-plus" style={{fontSize:"16px",fontWeight:"bold"}}></i> Crear entrega
           </Button>

           <Button
              radius="large"
              className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-2 mr-3 mb-9 font-bold text-base"
              onClick={controlModalImportacion.onOpen} >
              <i className="pi pi-plus" style={{fontSize:"16px",fontWeight:"bold"}}></i> Importar entrega
           </Button>

           </>
           )
          }

          <Button onClick={controlModalRegistro.onOpen} variant="faded" radius="large" className="py-6 mt-2 ml-3 text-base" startContent={<RiFileList3Line size="22px"/>}>
            Previsualizar calificaciones
          </Button>

          <Button onClick={() => setEditarEntregas(!editarEntregas)} variant="faded" radius="large" className="py-6 mt-2 ml-3 text-base" >
           {
            editarEntregas
            ?
            (
             <>
              <IoIosArrowBack size="25px"></IoIosArrowBack>
              Regresar
             </>
            )
            :
            (
            <>
            <FiEdit2 size="19px"></FiEdit2>
            Editar entregas
            </>
            )
           }
          </Button>

       </div>
       </div>
      {
       entregas.map( (entrega, index) => (
        <div key={index} className="flex">
        <Button onClick={ () => editarEntregas?mostrarCardModificarEntrega(entrega.id):mostrarCalificacionesEntrega(entrega.id)} className="flex bg-white justify-between w-full mb-4 py-11" endContent={ editarEntregas?<p className="text-base mr-2"> Editar</p>:<GrNext className="text-xl"/> }>
         <div >
         <p className="text-2xl font-medium ml-4" style={{width:'0px'}}>
         {
          entrega.nombre
         }
         </p>
         <p className="flex justify-start ml-4">
         {
          entrega.claseCriterio_detail.criterio_detail.nombre
         }
         </p>

         <p className="text-xs ml-4">
         {
          entrega.fecha
         }
         </p>
         </div>
        </Button>

        {
         editarEntregas && (
         <Button isIconOnly className="mt-6 ml-3" variant="faded" onClick={() => {setEntregaSeleccionada(entrega); controlModalBorrar.onOpen() }}>
          <MdDelete size="36px"/>
        
         </Button>
         )
        }

        </div>
       )
      )
      }
      </>
     ):
     (
      <>
     <Button onClick={ () => { setMostrarEntregaExtraida(false) }} variant="faded" radius="large" startContent={<IoIosArrowBack size="23px"/>} className="text-base px-4"> { "Regresar a entregas"}</Button>

     <div className="flex justify-between w-full">
                      <Button
                      radius="large"

                      className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-0 mb-1 font-bold text-base"
                      onClick={controlModalImportacion.onOpen}
                      >
                      <i className="pi pi-folder-open" style={{fontSize:"18px",fontWeight:"bold"}}></i> Cambiar archivo 
                  </Button>


                      
                      <Button
                        isDisabled={calificacionesCompletas?false:true}
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-3 mb-1 font-bold text-base"
                        onClick={crearEntrega}
                     >
                        <i className="pi pi-save" style={{fontSize:"18px",fontWeight:"bold"}}></i> Crear entrega
                    </Button>
                    </div>



       <h2 className="text-3xl font-semibold  py-3">Resumen de la extraccion</h2>
       <hr></hr>
       <h2 className="text-xl mt-4 mx-2"> <span className="text-xl font-semibold"> Nombre de la entrega: </span> 
       {
        entregaExtraida.nombre
       }
       </h2>
       <h2 className="text-xl mx-2">  <span className="text-xl font-semibold">Fecha:</span> {entregaExtraida?.fecha}</h2>
      <h2 className="text-xl mx-2 mb-4 "> <span className="font-semibold"> Numero de calificaciones identificadas: </span> {calificacionesExtraidas?.length}</h2>

      <hr></hr>
      <br></br>
      <h2 className="text-2xl font-semibold text-center"> Calificaciones encontradas</h2>
      <table style={{width:"100%"}}>
      <thead>
        <tr>
          <th className="text-xl py-3">Matricula</th>
          <th className="text-xl py-3">Nota</th>
        </tr>
      </thead>
      <tbody>
      {

      calificacionesExtraidas?.map( (calificacion, index) => (
      <tr key={index} style={{border:"2px solid"}}>
       <td className="text-xl text-center py-3"> {calificacion.matricula} </td>
       <td className="text-xl text-center py-3"> {calificacion.nota}</td>      
      </tr>
      ))
      
      }
      </tbody>
      </table>


      </>
     )
    }

    
      <ModalEntregas controlModal={controlModal} modoEdicion={editarEntregas} setEntregas={setEntregas} setMostrarEntregas={setMostrarEntregas} nrc={dataClase.nrc} entrega={entregaSeleccionada} ></ModalEntregas>
      <ModalImportarEntrega controlModal={controlModalImportacion} modoEdicion={editarEntregaExtraida} entrega={entregaExtraida} setEntregaExtraida={setEntregaExtraida} setCalificacionesExtraidas={setCalificacionesExtraidas} manejarArchivo={manejarArchivo} setArchivoEntrega={modificarEstadoArchivo} extraerDatosArchivoEntrega={extraerDatosArchivoEntrega} nrc={dataClase.nrc}/>
      <ModalBorrarEntrega controlModal={controlModalBorrar} entregaBorrada={entregaSeleccionada} eliminarEntrega={eliminarEntrega} />
      <RegistroCalificaciones controlModal={controlModalRegistro} entregasExistentes={entregas}/>
    </>
    )
    }

    </>
    ):
    (
       <Calificaciones nrc={dataClase.nrc} entrega={entregaSeleccionada} mostrarVistaEntregas={mostrarVistaEntregas} />
    )
  }

      </>
)
}

export default Entregas;