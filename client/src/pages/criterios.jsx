import React, { useContext, useState, useRef, useEffect } from "react";
import { NavContext } from "../layouts/layoutProfesor";
import { claseContext } from "../layouts/layoutProfesor";
import { atom, useAtom } from "jotai";
import { alumnosAtom } from "./alumnos";

import CriterioModal from "../components/modalCriterios"
import ModalBorrarCriterio from "../components/modalBorrarCriterio";
import ErrorCarga from "../components/errorCarga";
import { Input, Card, CardBody, Button, Tooltip, useDisclosure } from "@nextui-org/react";


import { getAllCriterios, crearCriterio } from '../services/criterios.api';
import { getAllClaseCriterio, createClaseCriterio, getCriteriosByNRC, updateClaseCriterio, deleteClaseCriterio } from '../services/claseCriterio.api';
import toast from 'react-hot-toast';
import 'primeicons/primeicons.css';
import { MdDelete } from 'react-icons/md';

export const criteriosAtom = atom(false);

const criteriosPredeterminados = [
  {"nombre": "Tareas", "ponderacion": 20},
  {"nombre": "Practicas", "ponderacion": 20},
  {"nombre": "Proyecto", "ponderacion": 20},
  {"nombre": "Examen", "ponderacion": 20},
  {"nombre": "Asistencia", "ponderacion": 20},
];


const Criterios = () => {

  const { showNav, shownav } = useContext(NavContext);
  const { dataClase } = useContext(claseContext)
  const controlModal = useDisclosure();
  const controlModalBorrar = useDisclosure();

  const [ existenCriteriosAtom, setExistenCriteriosAtom ] = useAtom(criteriosAtom);
  const [ existenAlumnos, setExistenAlumnos ] = useAtom(alumnosAtom);

  console.log("Atomo:"+existenAlumnos)

  const [ criterios, setCriterios ] = useState([]);
  const criteriosModificados = useRef([]);
  const [ criteriosEliminados, setCriteriosEliminados ] = useState([])
  const [ existenCriterios, setExistenCriterios] = useState(false);
  const [ mostrarCriterios, setMostrarCriterios] = useState(false);
  const [ editarCriterios, setEditarCriterios] = useState(false);
  const [ criterioBorrado, setCriterioBorrado ] = useState("");
  const [ borrarCriterio, setBorrarCriterio ] = useState(false); 
  const [ maximo, setMaximo ] = useState(0);
  
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargaCorrecta, setCargaCorrecta] = useState(true);


  const crearCriteriosGenerales = async () => {
   let nombresCriteriosBD = []; //Almacena los nombres de todos los criterios generales existentes en la base de datos
   let criteriosUnicos = [] //Permite almacenar aquellos criterios que no se encuentran en la base de datos
   let criteriosBD = []; //Almacena los criterios existentes en la base de datos.
   let criteriosActualizados = [];
   let res = await getAllCriterios(); //Se obtienen todos los criterios de la tabla Criterio.
   console.log("Inicio"+res.data);
   criteriosBD = res.data;
   nombresCriteriosBD = res.data.map( (c) => c.nombre);
   let nombresCriterios = criterios.map( (c) => c.nombre)
   criteriosUnicos = criterios.filter( (c) => !nombresCriteriosBD.includes(c.nombre) && c.id==-1);
   let criteriosExistentes = [];

   //Se comprueba que criterios ya existen en la base de datos y se almacenan sus datos.
   for(let criterio of criterios)
   {
    let criterioExistente = undefined;
    if(criterio.id !=-1)
     criterioExistente = criterio;
    else
     criterioExistente = criteriosBD.find( (c) => c.nombre == (criterio.nombre));
    console.log(criterioExistente)
    if(criterioExistente)
    {
      let auxCriterioAgregado = {
        "id": criterioExistente.id_criterio,
        "nombre": criterio.nombre,
        "ponderacion": criterio.ponderacion,
        "existente":true
       
       }
       criteriosExistentes.push(auxCriterioAgregado);
    
    }
   }
   criteriosActualizados = criteriosExistentes;
   console.log(criteriosUnicos + ":" + criterios)

   //Se crean aquellos criterios que no estan en la base de datos.
     if(criteriosUnicos.length>0)
     {
     // for( let criterio of criteriosUnicos)
     // {
      let promesas = criteriosUnicos.map( (criterio) => {
       //console.log("c"+criterio.nombre);
       return crearCriterio({"nombre":criterio.nombre})
      })

      let respuestas = await Promise.all(promesas);
      respuestas.forEach( respuesta => {

        let criterio = criteriosUnicos.find( c => c.nombre == respuesta.nombre)
        let auxCriterioAgregado = {
         "id": respuesta.data.id_criterio,
         "nombre": respuesta.nombre,
         "ponderacion": criterio.ponderacion,
         "existente":false    
        }
        criteriosActualizados.push( auxCriterioAgregado);
      }
      ) 
     // }

     }
//   }).finally( () => {
    console.log("Salida:"+ criteriosActualizados);
   
   
   return await criteriosActualizados;
  }

  const crearListaCriterios = async () => {
   if(maximo==100)
   {
    let toastRegistro = toast.loading("Registrando los criterios...")
    try{
     let criteriosActualizados = await crearCriteriosGenerales();
     console.log("DD:"+criteriosActualizados)
 //    crearCriteriosGenerales().then( (res) => console.log("R:"+ res));
 //    console.log("CA:"+ criteriosActualizados)
    // for( let criterio of criteriosActualizados)
    // {
      let promesas = criteriosActualizados.map( criterio => {
      
       let claseCriterio = {
        "id_clase": dataClase.nrc,
        "id_criterio": criterio.id,
        "nombre": criterio.nombre,
        "ponderacion": criterio.ponderacion
       }
       return createClaseCriterio(claseCriterio);
      }
     )

     await Promise.all(promesas);
    //}

    setEditarCriterios(false);
    setExistenCriterios(true);
    setExistenCriteriosAtom(true);
    toast.dismiss(toastRegistro);
    toast.success("¡Se han guardado los criterios correctamente!")
    }catch(e){
     toast.error("¡Ha ocurrido un problema al intentar crear los criterios!, vuelva a pulsar el boton para reintentarlo.")
    }
   }
   else
   {
    toast.error("¡Accion no valida!, para guardar los cambios todos los criterios deben sumar 100%.")
   }
  }
  
  const modificarCriterio = (nombreCriterio, valor) =>{

   let auxCriterios = [...criterios];
   let posicionCriterio = criterios.findIndex( (c) => c.nombre==nombreCriterio)
   console.log(auxCriterios[posicionCriterio]);
   if(!isNaN(valor) && valor!="") 
   { 
    if((maximo + parseInt(valor) - parseInt(auxCriterios[posicionCriterio].ponderacion))<=100 && parseInt(valor)>=0)
    {
     let valorNumerico = 0;
     if(valor!="")
      valorNumerico = parseInt(valor)
     setMaximo(maximo- parseInt(auxCriterios[posicionCriterio].ponderacion)+parseInt(valorNumerico))
     auxCriterios[posicionCriterio].ponderacion = parseInt(valorNumerico);
    }
   }
   else if(valor!="")
   {
    auxCriterios[posicionCriterio].nombre = valor;
    console.log(auxCriterios)
//    setMaximo(maximo)
   }
   setCriterios(auxCriterios);
/*   else
   {
    let criterio = criterios.find( (c) => c.nombre==nombreCriterio)
    if(!isNaN(valor))
     criterio.ponderacion = valor; 
    else
     criterio.nombre = valor;
    criteriosModificados.current.push(criterio);
   }*/
  }

  const eliminarCriterio = (nombre) =>{
   if(criterios.length>1)
   {
    let criterio = criterios.find( (c) => c.nombre==nombre)
    setCriteriosEliminados([...criteriosEliminados,criterio]);
    console.log(criterios.filter( (c) => c.nombre!=nombre));
    setCriterios(criterios.filter( (c) => c.nombre!=nombre));
    setMaximo(maximo-criterio.ponderacion);
   }
   else
   {
    toast.error("¡Accion no valida!, la clase debe tener al menos 2 criterios para poder utilizar la opcion de borrar.");
   }
  }

  const guardarModificaciones = async () => {
   console.log(criteriosEliminados.length);
   if(maximo==100)
   {
    let toastGuardar = toast.loading("Guardando cambios...");
    if(criteriosEliminados.length>0)
    {
     //for(let criterio of criteriosEliminados)
     //{
     let promesas = criteriosEliminados.map( criterio => deleteClaseCriterio(criterio.id) );
     await Promise.all(promesas);
     //}
    }

    let criteriosActualizados = await crearCriteriosGenerales();

    console.log(criteriosActualizados)

   // for(let criterio of criteriosActualizados)
   // {
      let promesas = criteriosActualizados.map( criterio => {
      let claseCriterio = {
        "id_clase": dataClase.nrc,
        "id_criterio": criterio.id,
        "nombre": criterio.nombre,
        "ponderacion": criterio.ponderacion
      }

       if(!criterio.existente || (criterios.find( (c)=> c.nombre == criterio.nombre).id == -1) )
       {
        return createClaseCriterio(claseCriterio);
       }
       else
       {
        let auxCriterio = criterios.find( (c) => c.nombre == criterio.nombre);
        console.log("Else")
        return updateClaseCriterio(auxCriterio.id, claseCriterio);
       }
      }
     )
     await Promise.all(promesas)
   // }

    if(criterios.find( (c) => c.id==-1))
     setCriterios(criteriosActualizados)

    setEditarCriterios(false);
    setExistenCriterios(true);
    toast.dismiss(toastGuardar);
    toast.success("¡Se han guardado los criterios correctamente!")
    
   }
   else
   {
    toast.error("¡Accion no valida!, para guardar los cambios todos los criterios deben sumar 100%.")
    
   }

  }



  //
  // ----------------------------------------------------
  // --- Estados de la variable 'resultadoExtraccion' ---
  // ----------------------------------------------------
  //
  // 0 => Indica que la extraccion se realizo correctamente
  //
  // 1 => Indica que el archivo esta vacio
  //
  // 2 => Indica que el Excel tiene una estructura interna invalida.
  //
  // 3 => Indica que se ha seleccionado un archivo con un tipo diferente a PDF
  //
  // 4 => Indica que se intentando comenzar con el proceso de lectura del PDF sin tener algun archivo seleccionado.
  //
  const [resultadoExtraccion, setResultadoExtraccion] = useState(-1);

  // Esta variable contiene los mensajes que aparecen en cada uno de los posibles escenarios identificados hasta el momento.
  const mensajesImportacion = ["¡Se han importado los datos del PDF exitosamente!",
                               "¡¡¡El archivo PDF esta vacio!!!",
                               "¡¡¡La estructura del documento no es valida!!!",
                               "¡¡¡El tipo de archivo no es valido!!!",
                               "¡Seleccione primero un archivo!",  
                              ];


  
    //
    // ----------------------------------------------------------------------------------
    //  Esta funcion detecta cuando se ha seleccionado un archivo mediante el formulario
    // ----------------------------------------------------------------------------------
    //
    const manejarArchivo = (e) =>{
      let archivoSeleccionado = e.target.files[0];
  
      if (archivoSeleccionado) {
        let tipoArchivo = archivoSeleccionado.type;
        console.log(tipoArchivo);
        if (tipoArchivo === "application/pdf" || tipoArchivo === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") { // Validar que sea un archivo PDF
          let leerArchivo = new FileReader();
          leerArchivo.readAsArrayBuffer(archivoSeleccionado);
          leerArchivo.onload = (e) => {
            setArchivoPDF(e.target.result);
          };
        }
        else
        {
         setResultadoExtraccion(3);
        } 
  
      }
    }
    
    const cargarCriterios = async() =>{
      try{
       let listaCriterios = await getCriteriosByNRC(dataClase.nrc);
       console.log("r"+listaCriterios.data.length)
       if(listaCriterios.data.length>0)
       {
        console.log("r"+listaCriterios.data.length)
        let criteriosClase = listaCriterios.data.map( (c) => {
         let auxCriterio = {
         "id": c.id,
         "nombre": c.nombre,
         "ponderacion": c.ponderacion
         }
         return auxCriterio;
        }
        )
        setCriterios(criteriosClase);
        setExistenCriterios(true);
        setExistenCriteriosAtom(true); 
        setMostrarCriterios(true);
        setMaximo(100);
       }
       else
       {
        setExistenCriterios(false);
        setExistenCriteriosAtom(false);
       }
       setCargando(false);
      } catch(e)
      {
       setCargando(false);
       setCargaCorrecta(false);
       console.log(e);
      }
     }
 
  
  useEffect( () => {


    cargarCriterios();
    showNav();
  }, [editarCriterios])

  useEffect(()=>{},[criterios])

  console.log(shownav)

  return (
    <div>

     {
      !cargaCorrecta?
      (
       <ErrorCarga mensajeError="Parece que ha ocurrido un problema al intentar cargar los criterios" reintentarCarga={cargarCriterios}/>
      )
      :
      (
      <>
            {
            
            (!mostrarCriterios) &&  (
            <div className="flex flex-col items-center justify-start min-h-full">
              <div className="flex flex-col items-center justify-center">
                    <h1 className="text-center text-3xl font-bold mt-6 mb-4">Parece que aun no hay ningun criterios de evaluacion para esta clase.</h1>
                    <h3 className="text-center text-xl mb-8" style={{color:"lightgrey"}}>Comience con alguna de las siguientes opciones:</h3>

                    <div>
                    <Button
                        radius="large"
                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-2 mr-3 mb-10 font-bold text-base"
                        onClick={ () => {  setMostrarCriterios(true); setEditarCriterios(true);}}
                    >
                        <i className="pi pi-plus" style={{fontSize:"16px",fontWeight:"bold"}}></i> Crear criterios
                    </Button>


                 </div>
        
        
                </div>
                </div>
            )
    }

    {

     mostrarCriterios && (
     <>

     {
      editarCriterios?
     (
     <div className="flex items-col justify-between">
      <Button onPress={ ()=> {setEditarCriterios(false); if(!existenCriterios) {setMostrarCriterios(false)} }} className="py-6 text-base">
        <i className="pi pi-times"></i>Cancelar</Button>
      <Button onPress={existenCriterios?guardarModificaciones:crearListaCriterios} isDisabled={maximo<100?true:false} className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-2 ml-3 mb-10 text-base"
                        >
       <i className="pi pi-save" style={{fontSize:"20px"}}></i> Guardar</Button>
     </div>
     )
     :
     (
      <div className="flex justify-between">
       <h2 className="text-3xl font-semibold ml-6 mt-1 mb-4">Criterios</h2>
       <Button onPress={()=> setEditarCriterios(true)} className=" text-base">
        <i className="pi pi-pencil"></i>
        Editar
       </Button>
      </div>
     )

     }
      <div>
      {criterios.map((item, index) => (
        <Card key={index} className="my-2">
          <CardBody>
            <div className="flex items-center justify-between font-medium text-xl ">
            {
             editarCriterios?
             (
              <div className="flex justify-between" style={{width:"100%"}} >
            
              <Input classNames={{input:"text-xl"}} type="text" onChange={(e) => {modificarCriterio(item.nombre, e.target.value)}} startContent={  <button onClick={ ()=> { setCriterioBorrado(item.nombre); controlModalBorrar.onOpen()}} className="mx-4" title="Borrar Criterio"> <MdDelete size="40px"/> </button>  } value={item.nombre} className={{input:["w65 shadow-xl","text-white/90 dark:text-white/90 font-thin"],          innerWrapper: "bg-transparent",
          inputWrapper: [
            "shadow-xl",
            "bg-default-200/50",
            "dark:bg-default/60",
            "backdrop-blur-xl",
            "backdrop-saturate-200",
            "hover:bg-default-200/70",
            "dark:hover:bg-default/70",
            "group-data-[focused=true]:bg-default-200/50",
            "dark:group-data-[focused=true]:bg-default/60",
            "!cursor-text",
          ],
}}/>
              <Input classNames={{input:"text-xl font-medium text-right"}} type="number" maxLength={3} max={100 - maximo + item.ponderacion} min={0} onChange={ (e) => {modificarCriterio(item.nombre, e.target.value)}} endContent="%" value={item.ponderacion}></Input>
              
              </div>
              )
              :
              (
               <>
               <span className="ml-4">{item.nombre}</span> 
               <span>{item.ponderacion}%</span>
               </>
              )
              }
            </div>
          </CardBody>
        </Card>
      ))}

      {
       editarCriterios &&
       (
        <>
        <Card className="my-2">
          <CardBody>
           <div className="flex justify-end">
            <span className="mr-2 text-xl font-medium">Total:</span>
            <span className="text-xl font-medium">{maximo}%</span>
           </div>
          </CardBody>
        </Card>
        <div className="flex justify-end">  
       
                    <Button
                        radius="large"
                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-10 mt-3 mb-10 font-bold text-base"
                        onClick={controlModal.onOpen}
                        isDisabled={maximo<100?false:true}
                    >
                    <i className="pi pi-plus"></i> Agregar criterio
                    </Button>
        </div>
        </>
       )
      }
    </div>

    <CriterioModal controlModal={controlModal} setCriterios={setCriterios} maximo={maximo} setMaximo={setMaximo}></CriterioModal>
    <ModalBorrarCriterio controlModal={controlModalBorrar} criterioBorrado={criterioBorrado} eliminarCriterio={eliminarCriterio}/>

    </>
     )
    }
    </>
      
    )
    }
    </div>
  )
}

export default Criterios