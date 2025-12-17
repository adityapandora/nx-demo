import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './styles.css';

const BraceletEditor = () => {
  const [dataFromBff, setDataFromBff] = useState({
    charmName: '',
  });

  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:5173/api');
      const data = await res.json();
      console.log('api response', data);
      setDataFromBff(data);
    })();
  }, []);

  const { siteId } = useParams();
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
