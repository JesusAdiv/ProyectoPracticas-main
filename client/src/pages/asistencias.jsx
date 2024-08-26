import React, { useContext, useState, useEffect } from "react";
import { NavContext, claseContext } from "../layouts/layoutProfesor";

const Asistencias = () => {
  const { showNav } = useContext(NavContext);
  const { dataClase } = useContext(claseContext);
  const [matricula, setMatricula] = useState("");

  useEffect(() => {
    showNav();
  }, []);

  const handleGuardar = () => {
    const nrc_clase = dataClase.nrc;

    const data = {
      matricula: matricula,
      materia_nrc: nrc_clase
    };

    fetch("http://127.0.0.1:8000/api/Asistencia/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Asistencia registrada:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });
  };

  const handleGenerarQR = () => {
    console.log("Generando código QR para:", matricula);
  };

  return (
    <div className="items-center text-center mt-10">
      <i className="pi pi-hammer" style={{ fontSize: "50px" }} />
      <h2 className="text-2xl font-bold">Sección de Asistencias</h2>

      <div className="mt-4">
        <label htmlFor="matricula" className="block text-xl font-medium text-gray-700">
          Matrícula:
        </label>
        <input
          type="text"
          id="matricula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded"
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
    </div>
  );
};

export default Asistencias;
