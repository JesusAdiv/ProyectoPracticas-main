import React, { useContext, useState, useEffect } from "react";
import { NavContext, claseContext } from "../layouts/layoutProfesor";

const Asistencias = () => {
  const { showNav } = useContext(NavContext);
  const { dataClase } = useContext(claseContext);
  const [matricula, setMatricula] = useState("");
  const [mensaje, setMensaje] = useState(""); // Agregado para mostrar mensajes

  useEffect(() => {
    showNav();
  }, [showNav]);

  const handleGuardar = async () => {
    const nrc_clase = dataClase.nrc;
    const data = {
      matricula: matricula,
      materia_nrc: nrc_clase
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/Asistencia/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setMensaje("Asistencia registrada correctamente.");
        console.log("Asistencia registrada:", result);
      } else {
        const errorData = await response.json();
        const detail = errorData.detail || "";

        if (detail.includes("Invalid pk")) {
          setMensaje("La matrícula no está registrada en el sistema.");
        } else if (detail.includes("no está inscrito en la clase")) {
          setMensaje("El alumno no está inscrito en la clase o no tiene una inscripción activa.");
        } else {
          setMensaje("Ocurrió un error al registrar la asistencia.");
        }
        console.error("Error:", errorData);
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor.");
      console.error("Error al conectar con el servidor:", error);
    }
  };

  const handleGenerarQR = () => {
    console.log("Generando código QR para:", matricula);
  };

  return (
    <div className="items-center text-center mt-10">
      <h2 className="text-2xl font-bold">Sección de Asistencias</h2>

      <div className="mt-4">
        <label htmlFor="matricula" className="block text-xl font-medium text-white">
          Matrícula:
        </label>
        <input
          type="text"
          id="matricula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded text-black"
          placeholder="Ingresa la matrícula"
        />
      </div>

      <div className="mt-4">
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
        >
          Guardar
        </button>
        <button
          onClick={handleGenerarQR}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        >
          Generar QR
        </button>
      </div>

      {/* Mostrar el mensaje debajo del botón */}
      {mensaje && (
        <div className="mt-4 border border-gray-300 text-red-500 px-4 py-2 inline-block">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Asistencias;
