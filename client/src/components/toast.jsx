
import { Toaster} from 'react-hot-toast';


export default function Toast() {
  return (  
      <Toaster
      position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff'
          }
        }}>        
      </Toaster>
  );
}

