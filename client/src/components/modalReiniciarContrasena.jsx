import React, { useState, useEffect, useContext } from "react";
import { Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, useDisclosure, Button, Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { claseContext } from "../layouts/layoutProfesor";
import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { getCriteriosByNRC } from "../services/claseCriterio.api";
import { createEntrega } from "../services/entrega.api"
import { createCalificacion} from "../services/calificacion.api"

import {Select, SelectSection, SelectItem} from "@nextui-org/react";
import { MdLockReset } from "react-icons/md"
import { RiErrorWarningFill } from "react-icons/ri";


export default function ModalReiniciarContrasena({ controlModal, usuario, reiniciarContrasena}) {


  return (  
    <Modal classNames={{closeButton:"text-foreground-white text-2xl hover:bg-black active:text-black"}} isOpen={controlModal.isOpen} onOpenChange={controlModal.onOpenChange} >
    <ModalContent>
     {
      (onClose) => (
       <>
       <ModalHeader className="bg-gradient-to-tr from-primary-100 to-primary-200 text-2xl text-white font-bold">
       <MdLockReset size="34px" className="mr-3"/>

        Reiniciar contraseña
       </ModalHeader>
       <ModalBody className="gap-1 text-black">
       <h2 className="font-semibold text-xl">¿Quieres reiniciar la contraseña de {usuario.nombre}?</h2>
       <h3 className="text-base">Se enviara la contraseña generada al correo registrado para este profesor.</h3> 


       </ModalBody>
       <ModalFooter>
        <Button color="danger" style={{fontWeight:"bold"}} className="px-12 py-6 mt-2 font-bold text-base" onPress={onClose}>Cancelar</Button>
        <Button
                        radius="large"

                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white py-6 mt-2 ml-3 mb-10 font-bold text-base"
                        onClick={() => {reiniciarContrasena(usuario.id); onClose()}}
                    >
                        <i className="" style={{fontSize:"18px",fontWeight:"bold"}}></i> Reiniciar contraseña
                    </Button>


       </ModalFooter>
       </>
      )
     }
    </ModalContent>
    </Modal>
);
}
