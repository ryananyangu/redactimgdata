import html2canvas from "html2canvas";
import React, { useState, createRef } from "react";

const HTTP_SUCCESS = 200;

export default function Home() {
  const [extractText, setExtractText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [cloudinaryResponse, setCloudinaryResponse] = useState("");
  const [image, setImage] = useState();
  const [output, setOutput] = useState();
  const [result, setResult] = useState(false);
  const capture = createRef();


  const reduceText = async () => {
    if (selectedFile && extractText) {
      await readFile(selectedFile).then((encoded_file) => {
        setImage(encoded_file);
        uploadHandler(encoded_file);
      });
    }
  };
  const showOutput = async () => {
    let img;

    await html2canvas(capture.current, {
      scale: 1,
      logging: true,
    }).then((canvas) => {
      console.log(canvas);
      img = canvas.toDataURL();
    });
    setOutput(img);
  };

  const uploadHandler = (base64) => {
    console.log("uploading to backend...");
    setResult(true)
    try {
      fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ data: base64 }),
        headers: { "Content-Type": "application/json" },
      }).then((response) => {
        console.log("successfull session", response.status);
        if (response.status === HTTP_SUCCESS) {
          response.text().then((result) => {
            setCloudinaryResponse(result.replace(extractText, "XXX"));
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
    <div className="container">
      <h3>Reduce Data from Scanned documents with nextjs</h3>
      <div className="row">
        <div className="column">
          <input
            type="file"
            accept="image/png, image/gif, image/jpeg"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          {selectedFile && (
            <div className="section">
              <input
                type="text"
                onChange={(e) => setExtractText(e.target.value)}
                value={extractText}
                className="input"
              />{' '}

              <button onClick={reduceText}>Reduce text</button>
              <br /><br />
              <img src={image} /><br /><br />
            </div>
          )}
        </div>
      </div>
      {result &&
        <div className="row">
          <div className="column">
            {output && <img src={output} />}
            {cloudinaryResponse && <div style={{ color: "black" }} ref={capture}>{cloudinaryResponse}</div>}
            {cloudinaryResponse ? <button onClick={showOutput}>Show output</button> : <img src="https://res.cloudinary.com/dogjmmett/image/upload/v1652789616/loading_fjpxay.gif" alt="this slowpoke moves" width="250" />}
          </div>
        </div>
      }
    </div>
  );
}
