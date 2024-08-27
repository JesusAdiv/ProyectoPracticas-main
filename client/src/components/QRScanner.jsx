import React, { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRScanner = ({ onScan }) => {
  const [result, setResult] = useState('');
  const videoRef = useRef(null);

  const startScan = () => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
      if (result) {
        setResult(result.text);
        if (onScan) {
          onScan(result.text); // Llama a la función onScan con el resultado del escaneo
        }
      }
      if (error) {
        console.error(error);
      }
    });
  };

  return (
    <div>
      <button 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
      onClick={startScan}>Iniciar Camara
      </button>
      <div className="mt-4"> {/* Agregamos un contenedor con margen superior */}
    <video ref={videoRef} style={{ width: '100%' }} />
  </div>
    </div>
  );
};

export default QRScanner;
