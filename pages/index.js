import html2canvas from "html2canvas";
import React, { useState, useRef } from "react";

const HTTP_SUCCESS = 200;

export default function Home() {
  const [extractText, setExtractText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [cloudinaryResponse, setCloudinaryResponse] = useState("");
  const [extracted, setExtracted] = useState("");
  const [image, setImage] = useState();
  const outputRef = useRef();
  const downloadRef = useRef();

  const reduceText = () => {
    if (selectedFile && extractText) {
      readFile(selectedFile).then((encoded_file) => {
        setImage(encoded_file);
        uploadVideo(encoded_file);
      });
      let final = cloudinaryResponse.replace(`/${extractText}/g`, "XXXXX");
      console.log(cloudinaryResponse);
      console.log(extractText);
      console.log(final);
      setExtracted(final);
    }
  };

  const onDownload = () => {
    let img;

    html2canvas(outputRef.current, {
      scale: 1,
      logging: true,
    }).then((canvas) => {
      img = canvas.toDataURL();
    });

    downloadRef.current.href = img;
    downloadRef.current.download = new Date().getTime() + "-extracted.png";
  };
  const uploadVideo = (base64) => {
    console.log("uploading to backend...");
    try {
      fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ data: base64 }),
        headers: { "Content-Type": "application/json" },
      }).then((response) => {
        console.log("successfull session", response.status);
        if (response.status === HTTP_SUCCESS) {
          response.text().then((result) => {
            setCloudinaryResponse(result);
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const readFile = (file) => {
    console.log("readFile()=>", file);
    return new Promise(function (resolve, reject) {
      let fr = new FileReader();

      fr.onload = function () {
        resolve(fr.result);
      };

      fr.onerror = function () {
        reject(fr);
      };

      fr.readAsDataURL(file);
    });
  };

  return (
    <div>
      <input
        type="file"
        accept="image/png, image/gif, image/jpeg"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      {selectedFile && (
        <>
          <input
            type="text"
            onChange={(e) => setExtractText(e.target.value)}
            value={extractText}
          />
          <img src={image} />
        </>
      )}

      {extractText && <button onClick={reduceText}>Reduce text</button>}
      {cloudinaryResponse && (
        <>
          {extracted && <div ref={outputRef}>{extracted}</div>}
          <button onClick={onDownload}>Download Image</button>
          <a ref={downloadRef}>Extracted link</a>
        </>
      )}
    </div>
  );
}
