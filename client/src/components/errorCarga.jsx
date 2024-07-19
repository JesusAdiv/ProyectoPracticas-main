import React, { useContext, useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Divider } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { claseContext } from "../layouts/layoutProfesor";

export default function ErrorCarga({ mensajeError, reintentarCarga }) {



  return (  
              <div className="flex flex-col items-center justify-center mt-11">
               <i style={{fontSize:"74px"}} className="pi pi-exclamation-triangle font-medium mb-3"/>
               <h2 className="text-2xl font-bold w-12/12">{mensajeError}</h2>
               <Button startContent={ <i className="pi pi-refresh text-xl font-semibold"/>}
                        size="lg"
                        radius="large"
                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-10 mr-3 mb-11 font-bold text-base"
                        onClick={() => { reintentarCarga()}}
               
               >
                Reintentar
               </Button>
              </div>
  );
}
