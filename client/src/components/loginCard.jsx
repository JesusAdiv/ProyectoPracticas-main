import React, { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { Link, useNavigate } from "react-router-dom";

import { autenticarProfesor } from "../services/profesor.api";
import toast from "react-hot-toast";

export default function LoginCard() {
  const [email, setEmail] = useState(""); // Estado para almacenar el valor del email
  const [contrasena, setContrasena] = useState("");

  const navigate = useNavigate();


  const limpiarTexto = (texto) => {
   return texto.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value); // Actualizar el estado del email cuando cambia el valor del campo de entrada
  };
  console.log("Valor actual de email:", email);

  const handleContrasenaChange = (e) => {
    setContrasena(e.target.value); // Actualizar el estado del email cuando cambia el valor del campo de entrada
  };

  const verificarDatosLogin = () => {
   autenticarProfesor(email, contrasena).then( (res) =>{
    console.log(res)
    if(res.data.estadoSesion==0)
    {
     window.localStorage.setItem("sesionUsuarioApp", JSON.stringify(res.data));
     window.location.href = "/profesor?nombre="+res.data.nombre+"&email="+res.data.correo;
    }
    else if(res.data.estadoSesion==1)
    {
     toast.error("¡Debe llenar todos los campos para iniciar sesion!");
     //console.log("g")
    }

   })
  }

  
  return (
    <div className="bg-secondary-100 px-10 py-14 rounded-3xl">
      <h1 className="text-6xl font-semibold">Bienvenido</h1>
      <p className="font-medium text-lg text-gray-300 my-8">Ingrese sus datos:</p>
      <div className="mt-4 ">
        <Input
          type="email"
          label="Usuario"
          variant="bordered"
          color="primary"
          value={email} // Asignar el valor del email al campo de entrada
          onChange={handleEmailChange} // Manejar el cambio del valor del email
        />
      </div>
      <div className="mt-4">
        <Input onChange={handleContrasenaChange} type="password" label="Contraseña" variant="bordered" color="primary" />
      </div>
      <div className="flex justify-end items-center pt-8">
          <Button onClick={verificarDatosLogin} variant="fade" className="bg-gray-200 text-black text-base font-semibold">
            Iniciar sesion
          </Button>
      </div>
    </div>
  );
}
