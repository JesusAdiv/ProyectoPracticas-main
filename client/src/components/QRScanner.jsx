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
      <button onClick={startScan}>Iniciar Escaneo</button>
      <video ref={videoRef} style={{ width: '100%' }} />
      <div>Resultado: {result}</div>
    </div>
  );
};

export default QRScanner;
