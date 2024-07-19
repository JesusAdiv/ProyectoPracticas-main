import React, { useState, useEffect, useContext } from "react";
import { Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, useDisclosure, Button, Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { claseContext } from "../layouts/layoutProfesor";
import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { getCriteriosByNRC } from "../services/claseCriterio.api";
import { createEntrega } from "../services/entrega.api"
import { createCalificacion} from "../services/calificacion.api"

import {Select, SelectSection, SelectItem} from "@nextui-org/react";
import { MdDelete } from "react-icons/md"
import { RiErrorWarningFill } from "react-icons/ri";




export default function ModalBorrarCriterio({ controlModal, criterioBorrado, eliminarCriterio}) {


  return (  
    <Modal classNames={{closeButton:"text-foreground-white text-2xl hover:bg-black active:text-black"}} isOpen={controlModal.isOpen} onOpenChange={controlModal.onOpenChange} >
    <ModalContent>
     {
      (onClose) => (
       <>
       <ModalHeader className="bg-gradient-to-tr from-primary-100 to-primary-200 text-2xl text-white font-bold">
       <MdDelete size="30px" className="mr-3"/>

        Borrar criterio
       </ModalHeader>
       <ModalBody className="gap-1 text-black">
       <h2 className="text-xl font-semibold">¿Quieres borrar el criterio: {criterioBorrado}?</h2>
       <h3 className="text-base">Esta accion aun se puede revertir mientras no se pulse el boton guardar cambios.</h3> 


       </ModalBody>
       <ModalFooter>
        <Button color="danger" style={{fontWeight:"bold"}} className="px-12 py-6 mt-2 font-bold text-base" onPress={onClose}>Cancelar</Button>
        <Button
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-2 ml-3 mb-10 font-bold text-base"
                        onClick={() => {eliminarCriterio(criterioBorrado); onClose()}}
                    >
                        <i className="pi pi-trash" style={{fontSize:"18px",fontWeight:"bold"}}></i> Borrar criterio
                    </Button>


       </ModalFooter>
       </>
      )
     }
    </ModalContent>
    </Modal>
);
}
