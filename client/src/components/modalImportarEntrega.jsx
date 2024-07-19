import React, { useState, useEffect, useContext } from "react";
import { Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, useDisclosure, Button, Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { claseContext } from "../layouts/layoutProfesor";
import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { getCriteriosByNRC } from "../services/claseCriterio.api";
import { createEntrega } from "../services/entrega.api"
import { createCalificacion} from "../services/calificacion.api"

import {Select, SelectSection, SelectItem} from "@nextui-org/react";
import { MdOutlineLibraryAdd } from "react-icons/md";




export default function ModalImportarEntrega({ controlModal, modoEdicion, entrega, setEntrega, manejarArchivo, setArchivoEntrega, extraerDatosArchivoEntrega, nrc}) {
  const { datosClase } = useContext(claseContext)
  const [ criterios, setCriterios ] = useState([]);
  const [ nombreEntrega, setNombreEntrega ] = useState("");
  const [ tipo, setTipo ] = useState(null); 


  useEffect( ()=>{

    const obtenerCriterios = async () =>{

      let listaCriterios = await getCriteriosByNRC(nrc);
      setCriterios(listaCriterios.data);

    }

    obtenerCriterios();

    if(modoEdicion)
    {
     setTipo(entrega.tipo)
    }
  }, []);

  return (  
    <Modal isDismissable={false} classNames={{closeButton:"text-foreground-white text-2xl hover:bg-black active:text-black"}} isOpen={controlModal.isOpen} onOpenChange={controlModal.onOpenChange} >
    <ModalContent>
     {
      (onClose) => (
       <>
       <ModalHeader className="bg-gradient-to-tr from-primary-100 to-primary-200 text-xl text-white font-bold">
       <MdOutlineLibraryAdd size="28px" className="mr-2"/>

        Importar entrega
       </ModalHeader>
       <ModalBody className="gap-1 text-black">
       <h2 className="font-semibold "><i className="pi pi-info-circle mr-1 text-2xl"/> Nota: Esta opcion unicamente esta disponible para los archivos de Teams.</h2>
       <label htmlFor="cargar" className="text-xl font-semibold my-2">Seleccione su archivo: </label>
       
       <input type="file" accept=".xlsx,text/csv" id="cargar" name="archivo" onChange={ (e) => {manejarArchivo(e, setArchivoEntrega)} } />

       <label htmlFor="nombreP" className="font-semibold mt-2">Tipo de entrega</label>
         <Select onChange={(e) => setTipo( e.target.value)} isRequired radius="sm" classNames={{ label:"text-black"}} variant="bordered" labelPlacement={"outside"} placeholder={modoEdicion?criterios.find((c)=> c.id_criterio==entrega.tipo)?.criterio_detail.nombre:"Seleccione un criterio"} aria-label="Tipo">
          {
           criterios.map( (c) => (
            <SelectItem key={c.id} value={c.id} className="text-black text-2xl">
             {c.criterio_detail.nombre}
            </SelectItem>
           ))
          }

         </Select>



       </ModalBody>
       <ModalFooter>
        <Button color="danger" style={{fontWeight:"bold"}} className="px-12 py-6 mt-2" onPress={onClose}>Cancelar</Button>
        <Button
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-2 ml-3 mb-10 font-bold text-base"
                        onClick={() => {extraerDatosArchivoEntrega(tipo);}}
                    >
                        <i className="pi pi-folder-open" style={{fontSize:"18px",fontWeight:"bold"}}></i> Extraer calificaciones
                    </Button>


       </ModalFooter>
       </>
      )
     }
    </ModalContent>
    </Modal>
);
}
