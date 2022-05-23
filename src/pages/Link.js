import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import ReactJson from 'react-json-view'


export const Link = () => {
  const fileId = useParams().id;
  const [jsonFile, setJsonFile] = useState(null);
  
  useEffect(() => {
    readFile();
  }, []);

  const readFile = async () => {
    const path = `./nft-files/${fileId}.json`;

    await fetch(path)
      .then(response => response.json())
      .then(data => {
        setJsonFile(data);
      })
      .catch(error => {
        window.location.href = '/';
      })
      ;    
  }

  if (!jsonFile) {
    return null;
  }

  return (
    <div className="minter">
      <ReactJson
        name='NFT' 
        src={jsonFile} 
        displayObjectSize={false} 
        displayDataTypes={false} 
        quotesOnKeys={false} 
      />
    </div>
  )
}

