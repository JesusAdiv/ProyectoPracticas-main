import React, { useContext } from "react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { claseContext } from "../layouts/layoutProfesor";

export default function MateriaCard({ clase }) {
  const { nrc, clave, nombreMateria, seccion } = clase;
  const {asignarDatos} = useContext(claseContext)

  const handleSelectClase = () => {
    asignarDatos(clase);
  };


  return (  
      <Card className="max-w-[400px] bg-gray-100">
        <Link to={`alumnos`} onClick={handleSelectClase}>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">{nombreMateria}</p>
            <p className="text-small text-default-500">NRC: {nrc}</p>
          </div>
        </CardHeader>
        </Link>
        <Divider />
        <CardBody>
          <div className="flex justify-between items-center gap-1">
            <p className="text-small">Sección: {seccion}</p>
            <p className="text-small">Clave: {clave}</p>
          </div>
        </CardBody>
      </Card>
  );
}
