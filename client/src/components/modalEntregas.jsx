import React, { useState, useEffect, useContext } from "react";
import { Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, useDisclosure, Button, Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { claseContext } from "../layouts/layoutProfesor";
import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { getCriteriosByNRC } from "../services/claseCriterio.api";
import { createEntrega } from "../services/entrega.api"
import { createCalificacion} from "../services/calificacion.api"
import { updateEntrega } from "../services/entrega.api";

import { parseDate } from "@internationalized/date";
import {Select, SelectSection, SelectItem} from "@nextui-org/react";
import {DatePicker} from '@nextui-org/react';
import { MdOutlineLibraryAdd } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import toast from "react-hot-toast";


export default function ModalEntregas({ controlModal, modoEdicion, setEntregas, setMostrarEntregas,nrc, entrega}) {
  const { datosClase } = useContext(claseContext)
  const [ criterios, setCriterios ] = useState([]);
  const [ nombreEntrega, setNombreEntrega ] = useState("");
  const [ tipo, setTipo ] = useState(null); 
  const [ fecha, setFecha ] = useState(null);

  const actualizarListaEntregas = (listaEntregas, entregaActualizada) => {
   let auxEntregas = [...listaEntregas];
   let posicionEntrega = listaEntregas.findIndex( (e) => e.id == entrega.id )
   auxEntregas[posicionEntrega].nombre = entregaActualizada.nombre;
   auxEntregas[posicionEntrega].tipo = entregaActualizada.tipo;
   auxEntregas[posicionEntrega].claseCriterio_detail = entregaActualizada.claseCriterio_detail;
   return auxEntregas;
  }

  const actualizarEntrega =  (onClose) => 
  {
   if(nombreEntrega!="")
   {
    let toastActualizar = toast.loading("Guardando los cambios...") 
    let entregaActualizada = {
     "nombre": nombreEntrega,
     "tipo": tipo,
     "fecha": fecha.year + "-" + fecha.month + "-" + fecha.day,
     "estado":"REGISTRADA"
    }

    updateEntrega(entrega.id,entregaActualizada).then( (res) => {
     console.log(res)
     setEntregas( (listaEntregas) => actualizarListaEntregas(listaEntregas, res.data) );
     onClose();
     toast.dismiss(toastActualizar);
     toast.success("¡Se ha actualizado la entrega exitosamente!")
    } ).catch( e =>{
     toast.error("¡Ha ocurrido un problema al intentar actualizar la entrega!, vuelva a pulsar el boton para reintentarlo.")
    });
   }
  }



  const crearEntrega = async (onClose) =>{

   if(nombreEntrega==null || tipo==null || fecha==null)
   {

   }
   else
   {
    try{
       
    let toastCreacion = toast.loading("Registrando la entrega...")
    let criterio = criterios.find( (c) => c.id==tipo);
    let listaAlumnos = await obtenerListaAlumnos(nrc);

   console.log(listaAlumnos)
   let entrega = {
    "nombre": nombreEntrega,
    "tipo": tipo,
    "fecha": fecha.year +"-"+ fecha.month +"-"+ fecha.day,
    "estado": "PENDIENTE"
   }
   createEntrega(entrega).then( (res) => {
    setEntregas( (listaEntregas) => [...listaEntregas, res.data]);
    setMostrarEntregas(true);
    //for(let alumno of listaAlumnos)
    //{

     let promesas = listaAlumnos.map( alumno => {
     let calificacion = {
      "nota": 0,
      "matricula": alumno.alumno_detail.matricula,
      "id_entrega": res.data.id
     }

     console.log(calificacion);
     return createCalificacion(calificacion);
    }
    )

    Promise.all(promesas).then( res2 =>{
      let entregaActualizada = res.data;
      entregaActualizada.estado = "REGISTRADA";
      updateEntrega(res.data.id, entregaActualizada ).then( res3 => {
        onClose();
        toast.dismiss(toastCreacion)
        toast.success("¡Se ha creado la entrega exitosamente!")
       }
      ).catch( e =>{
       toast.error("¡Ha ocurrido un problema al intentar crear la entrega!, vuelva a pulsar el boton para reintentarlo");
      })
     }
    )
   // }
   }
  ).catch( e =>{
    toast.error("¡Ha ocurrido un problema al intentar crear la entrega!, vuelva a pulsar el boton para reintentarlo");
   })

   //setMaximo( (maximo) => maximo + ponderacion);
  }catch(e){
    toast.error("¡Ha ocurrido un problema al intentar crear la entrega!, vuelva a pulsar el boton para reintentarlo");
  }
   }
  
  
  
  }

  useEffect( ()=>{

    const obtenerCriterios = async () =>{

      let listaCriterios = await getCriteriosByNRC(nrc);
      setCriterios(listaCriterios.data);
    }

    obtenerCriterios();

    if(modoEdicion)
    {
     console.log("Edicion")
     console.log(entrega);
     setNombreEntrega(entrega.nombre);
     console.log("Nombre:"+entrega.nombre)
     setTipo(entrega.tipo)
     setFecha( parseDate(entrega.fecha));
    }  
  }, [entrega]);

  return (  
    <Modal isDismissable={false} classNames={{closeButton:"text-foreground-white text-2xl hover:bg-black active:text-black"}} isOpen={controlModal.isOpen} onOpenChange={controlModal.onOpenChange} >
    <ModalContent>
     {
      (onClose) => (
       <>
       <ModalHeader className="bg-gradient-to-tr from-primary-100 to-primary-200 text-xl text-white font-bold">
       {
        modoEdicion
        ?
        (
        <>
         <TbEdit size="30px" className="mr-2"></TbEdit>
         Editar criterio
        </>
        )
        :
        (
        <>
        <MdOutlineLibraryAdd size="28px" className="mr-2"/>

        Crear entrega
        </>
        )
       }
       </ModalHeader>
       <ModalBody className="gap-1 text-black">
        
         <label htmlFor="nombreE" className=" font-semibold mt-3">Nombre</label>
         <input id="nombreE" className="px-2 border-2 border-black rounded" onChange={(e) => setNombreEntrega( e.target.value)} value={nombreEntrega} required/>

         <label htmlFor="nombreP" className="font-semibold mt-2">Tipo</label>
         <Select onChange={(e) => setTipo( e.target.value)} isRequired radius="sm" classNames={{ label:"text-black"}} variant="bordered" labelPlacement={"outside"} placeholder={modoEdicion?entrega.claseCriterio_detail.criterio_detail.nombre:"Seleccione un criterio"} aria-label="Tipo">
          {
           criterios.map( (c) => (
            <SelectItem key={c.id} value={c.id} className="text-black text-2xl">
             {c.criterio_detail.nombre}
            </SelectItem>
           ))
          }

         </Select>

         <label htmlFor="nombreE" className=" font-semibold mt-3">Fecha de entrega</label>

         <DatePicker onChange={setFecha} variant="bordered" radius="sm" value={fecha} ></DatePicker>
       </ModalBody>
       <ModalFooter>
        <Button color="danger" style={{fontWeight:"bold"}} onPress={onClose}>Cancelar</Button>

        {
         modoEdicion?
         (
          <>
          <Button type="submit" color="success" style={{background:"green",color:"white" ,fontWeight:"bold"}} onPress={() => {actualizarEntrega(onClose); }}>Guardar cambios</Button>
           
          </>
         )
         :
         (
          <>
          <Button type="submit" color="success" style={{background:"green",color:"white" ,fontWeight:"bold"}} onPress={() => {crearEntrega(onClose);  }}>Crear</Button>
          </>
         )
        }
       </ModalFooter>
       </>
      )
     }
    </ModalContent>
    </Modal>
);
}
