import React, { useContext, useState, useEffect } from "react";
import { NavContext } from "../layouts/layoutProfesor";
import ModalExtraerCorreos from "../components/modalExtraerCorreos";
import ModalReiniciarContrasena from "../components/modalReiniciarContrasena";
import { leerArchivoProfesores } from "../services/importacion";
import { updateCalificacion } from "../services/calificacion.api"
import { getAllProfesores, actualizarDatosProfesores, resetPassword } from "../services/profesor.api";

import axios from "axios";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Input, Card, CardBody, Button, Tooltip, useDisclosure } from "@nextui-org/react";
import { IoIosSchool } from 'react-icons/io';
import { FiEdit2 } from 'react-icons/fi'
import { IoIosArrowBack } from 'react-icons/io';

import { MdLockReset, MdDelete} from 'react-icons/md';

import toast from 'react-hot-toast';

const Profesores = () => {

  const controlModal = useDisclosure();
  const controlModalContrasena = useDisclosure();


  const [archivoProfesores, setArchivoProfesores] = useState();
  const [profesores, setProfesores] = useState(null);
  const [profesoresModificados, setProfesoresModificados] = useState([])
  const [datosExtraidos, setDatosExtraidos] = useState([]);
  const [mostrarDatosExtraidos, setMostrarDatosExtraidos] = useState(false)
  const [editarProfesores, setEditarProfesores] = useState(false);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);

  const reiniciarContrasena = (id_profesor) => {
   resetPassword(id_profesor).then((res)=> {
    toast.success("¡La contraseña se ha reiniciado exitosamente!")
   })
  }

  const ordenAlfabetico = (profesorA, profesorB) => {
   if(profesorA.nombre < profesorB.nombre)
    return -1;
   else if(profesorA.nombre > profesorB.nombre)
    return 1;
   else
    return 0;

  }

  const actualizarProfesores = (tipoActualizacion) => {
   console.log("TIpo: "+tipoActualizacion)
   console.log("Extraccion:"+mostrarDatosExtraidos+" | Edicion: "+editarProfesores)
   let JSONActualizacion = {}
   if(tipoActualizacion==1)
   {
    let nombresProfesoresBD = profesores.map((profesor) => profesor.nombre);
    let profesoresFiltrados = datosExtraidos.filter( (p) => nombresProfesoresBD.includes(p.nombre));
    JSONActualizacion = {"profesores": profesoresFiltrados,"tipoActualizacion":'1'}
    console.log(profesoresFiltrados)
   }
   else
   {
    JSONActualizacion = {"profesores": profesoresModificados,"tipoActualizacion":'2'}    
   }
   actualizarDatosProfesores(JSONActualizacion).then((res) => 
   {
    console.log("Actualizacion")
    setEditarProfesores(false);
    setMostrarDatosExtraidos(false);
    toast.success("¡Se han guardado los cambios exitosamente!");
   }
   );

  }

  const modificarEstadoArchivoProfesores = (archivoPDF) => setArchivoProfesores(archivoPDF);

  const extraerDatosArchivoProfesores = async() => {
   if(archivoProfesores)
   {
    await leerArchivoProfesores(archivoProfesores, setDatosExtraidos);
    controlModal.onClose();
    setMostrarDatosExtraidos(true);
    setEditarProfesores(false);

   }
  }

  const modificarProfesor = (id_profesor, valorModificado, tipoCampo) => {
   let listaProfesores = [...profesores];
   let listaModificada = [...profesoresModificados];
   let profesor;
   let posicionProfesor = -1;
   let posicionProfesorListaModificada = -1;

   posicionProfesor = profesores.findIndex((p) => p.id==id_profesor)

   if(profesoresModificados.length!=0 )
   {
    posicionProfesorListaModificada = profesoresModificados.findIndex((p) => p.id==id_profesor);
    if(posicionProfesorListaModificada==-1)
     posicionProfesorListaModificada = listaModificada.push(profesores[posicionProfesor])-1;
    
   }
   else
   {
    posicionProfesorListaModificada = listaModificada.push(profesores[posicionProfesor])-1;
   }
    

   if(tipoCampo==1)
   {
    listaProfesores[posicionProfesor].nombre = valorModificado;
    listaModificada[posicionProfesorListaModificada].nombre = valorModificado;
   }
   else
   {
    listaProfesores[posicionProfesor].correo = valorModificado;
    listaModificada[posicionProfesorListaModificada].correo = valorModificado;
   }

   setProfesores(listaProfesores);
   setProfesoresModificados(listaModificada);
  }




  useEffect(() => {

    const obtenerListaProfesores = async () => {
     let res = await getAllProfesores();
     setProfesores(res.data.sort(ordenAlfabetico));
     console.log(res)
    }

    obtenerListaProfesores();
    //console.log(getCalificacionesByEntrega(entrega.id)); 
  }, [mostrarDatosExtraidos])

/*  const modificarCalificacion = (id_calificacion, valor) =>{
    if(valor<=10)
    {
     let auxCalificaciones = [...calificaciones];
     let posicionCalificacion = calificaciones.findIndex( (c) => c.id==id_calificacion)
     console.log(auxCalificaciones[posicionCalificacion]);

     auxCalificaciones[posicionCalificacion].nota = parseFloat(valor);
     setCalificaciones(auxCalificaciones);
     setEditarCalificaciones(true);
    }
  }
*/    

  

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

  return (
    <>

    <div className="flex">

    {
      !editarProfesores && !mostrarDatosExtraidos &&
      (
       <>
       <div className="w-2/4">
       
       <h2 className="text-3xl font-semibold mt-8"> 
       {
        editarProfesores?
        (<>
         <FiEdit2/>
         <span>Editar</span>
         
        </>)
        :
        "Lista de profesores"
       }
       </h2>
       </div>
       <div className="flex w-2/4 justify-end">

                    <Button
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-3 mr-3 mb-10 font-bold text-base"
                        onClick={ () => {setEditarProfesores(true)}}
                    >
                        <i className="pi pi-pencil" style={{fontSize:"18px",fontWeight:"bold"}}></i> Modificar profesores
                    </Button>

                    <Button
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-0 mb-10 font-bold text-base"
                        onClick={controlModal.onOpen}
                    >
                        <i className="pi pi-folder-open" style={{fontSize:"18px",fontWeight:"bold"}}></i> { mostrarDatosExtraidos?"Cambiar archivo":"Importar datos"}
                    </Button>

       </div>
      </>
      )
                    
    }

                    {
                     (editarProfesores || mostrarDatosExtraidos) &&
                     (
                      <div className="flex flex-col justify-between w-full">
                      <div>
                      <Button onClick={() => {setEditarProfesores(false); setMostrarDatosExtraidos(false); }} variant="faded" radius="large" className="text-base"> 
                       <IoIosArrowBack size="24px"/>
                       Regresar a lista de profesores
                      </Button>
                      </div>
                      <div className="flex justify-between">
                      <div className="flex flex-row w-2/4 mt-8 ml-2">

                       <FiEdit2 size="28px" className="font-semibold mr-3"/>
                       <p className="text-3xl font-semibold ">
                        Editar
                       </p>

                      </div>

                      <div>
                      <Button
                      radius="large"

                      className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-0 mb-10 font-bold text-base"
                      onClick={controlModal.onOpen}
                      >
                      <i className="pi pi-folder-open" style={{fontSize:"18px",fontWeight:"bold"}}></i> { mostrarDatosExtraidos?"Cambiar archivo":"Importar Datos"}
                  </Button>
                      
                      <Button
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-5 ml-3 mb-10 font-bold text-base"
                        onClick={() => editarProfesores?actualizarProfesores(2):actualizarProfesores(1)}
                     >
                        <i className="pi pi-save" style={{fontSize:"18px",fontWeight:"bold"}}></i> Guardar cambios
                    </Button>
                    </div>
                    </div>
                    </div>
                     )
                    }

    </div>
    {
     mostrarDatosExtraidos
     ? 
     (
      <>
      <h2 className="text-3xl font-semibold mb-2">Resumen de la extraccion</h2>
      <hr></hr>
      <h2 className="text-2xl my-3">Numero de profesores identificados: {datosExtraidos.length}</h2>
      <hr></hr>
      <br></br>
      <table style={{width:"100%"}}>
      <thead>
        <tr>
          <th className="text-2xl py-3 pl-3 text-left">Nombre</th>
          <th className="text-2xl py-3 text-left">Correo</th>
        </tr>
      </thead>
      <tbody>
      {

      datosExtraidos.map( (profesor, index) => (
      <tr key={index} style={{border:"2px solid"}}>
       <td className="text-xl py-3 pl-3"> {profesor.nombre} </td>
       <td className="text-xl py-3"> {profesor.correo}</td>      
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
        <tr style={{border:"3px solid white"}}>
          <th className="text-2xl py-3 text-start pl-3">Nombre</th>
          <th className="text-2xl py-3 text-start">Correo</th>
          {
           editarProfesores && (
            <>
             <th className="text-2xl py-3"> Acciones</th>
            </>
           )
          }
        </tr>
       </thead>
       <tbody>

    {
     profesores?.map( (profesor, index) => (
      
    <tr key={index} className="text-center" style={{border:"3px solid grey"}}>
      
     { editarProfesores?

      (
      <>
        <td className="py-2 px-2">
         <Input classNames={{input: ["text-base font-semibold text-start"]}}  type="text" onChange={ (e) => {modificarProfesor(profesor.id, e.target.value, 1)}} value={profesor.nombre} ></Input>
        </td>
        <td className="py-2 px-2">
         <Input classNames={{input: ["text-base font-semibold text-start"]}}  type="text" onChange={ (e) => {modificarProfesor(profesor.id, e.target.value, 2)}} value={profesor.correo} ></Input>
        </td>

        <td>
         <Tooltip className="text-black font-semibold" content="Reiniciar Contraseña">
          <button onClick={ () => { setProfesorSeleccionado(profesor); controlModalContrasena.onOpen();}} >
           <MdLockReset size="40px"/>
          </button>
         </Tooltip>
        </td>
      </>
      )
      :
      (
       <>
     <td className="text-xl py-3 text-start px-2"> {profesor.nombre} </td>
     <td className="text-xl py-3 text-start"> {profesor.correo!=""?profesor.correo:"Vacio"} </td>
        
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

   <ModalExtraerCorreos controlModal={controlModal}  extraerDatosArchivoProfesores={extraerDatosArchivoProfesores} setArchivoProfesores={modificarEstadoArchivoProfesores}></ModalExtraerCorreos>
   <ModalReiniciarContrasena controlModal={controlModalContrasena} usuario={profesorSeleccionado} reiniciarContrasena={reiniciarContrasena} />
   </>
  )
}

export default Profesores;