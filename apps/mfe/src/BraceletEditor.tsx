import { useEffect, useState } from 'react';
import './styles.css';

const MFE_API_BASE = 'http://localhost:5173';

const BraceletEditor = () => {
  const [dataFromBff, setDataFromBff] = useState({
    charmName: '',
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(`${MFE_API_BASE}/api`);
      const data = await res.json();
      setDataFromBff(data);
    })();
  }, []);
  const siteId = window.location.pathname.split('/')[1];
  console.log('site id', siteId);
  return (
    <>
      <h1 className="text-3xl text-red-500">
        MFE with Site Id: {siteId ?? ''}{' '}
      </h1>
      <p>Charm Name: {dataFromBff.charmName}</p>
    </>
  );
};

export default BraceletEditor;
