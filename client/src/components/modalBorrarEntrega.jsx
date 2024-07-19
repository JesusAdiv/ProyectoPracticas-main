import React, { useState, useEffect, useContext } from "react";
import { Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, useDisclosure, Button, Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { claseContext } from "../layouts/layoutProfesor";
import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { getCriteriosByNRC } from "../services/claseCriterio.api";
import { createEntrega } from "../services/entrega.api"
import { createCalificacion} from "../services/calificacion.api"

import {Select, SelectSection, SelectItem} from "@nextui-org/react";

import { MdDelete } from "react-icons/md";
import { RiErrorWarningFill } from "react-icons/ri";




export default function ModalBorrarCriterio({ controlModal, entregaBorrada, eliminarEntrega}) {


  return (  
    <Modal classNames={{closeButton:"text-foreground-white text-2xl hover:bg-black active:text-black"}} isOpen={controlModal.isOpen} onOpenChange={controlModal.onOpenChange} >
    <ModalContent>
     {
      (onClose) => (
       <>
       <ModalHeader className="bg-gradient-to-tr from-primary-100 to-primary-200 text-2xl text-white font-bold">
       <MdDelete  size="31px" className="mr-3"/>

        Borrar entrega
       </ModalHeader>
       <ModalBody className="gap-1 text-black">
       <h3 className="text-xl font-semibold"> ¿Quieres borrar la entrega: {entregaBorrada.nombre}?</h3>
       <h2 className="text-base"> Al eliminar la entrega, se borraran todas las calificaciones asociadas a esta entrega.</h2> 


       </ModalBody>
       <ModalFooter>
        <Button color="danger" style={{fontWeight:"bold"}} className="px-12 py-6 mt-2 font-bold text-base" onPress={onClose}>Cancelar</Button>
        <Button
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-2 ml-3 mb-10 font-bold text-base"
                        onClick={() => {eliminarEntrega(entregaBorrada); onClose()}}
                    >
                        <i className="pi pi-trash" style={{fontSize:"18px",fontWeight:"bold"}}></i> Borrar entrega
                    </Button>


       </ModalFooter>
       </>
      )
     }
    </ModalContent>
    </Modal>
);
}
