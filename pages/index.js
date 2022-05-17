import html2canvas from "html2canvas";
import React, { useState, createRef } from "react";

const HTTP_SUCCESS = 200;

export default function Home() {
  const [extractText, setExtractText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [cloudinaryResponse, setCloudinaryResponse] = useState("");
  const [image, setImage] = useState();
  const [output, setOutput] = useState();
  const capture = createRef();

  const reduceText = async () => {
    if (selectedFile && extractText) {
      await readFile(selectedFile).then((encoded_file) => {
        setImage(encoded_file);
        uploadVideo(encoded_file);
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
          <button onClick={reduceText}>Reduce text</button>
        </>
      )}
      {output && <img src={output} />}
      {cloudinaryResponse && <div ref={capture}>{cloudinaryResponse}</div>}
      <button onClick={showOutput}>Show output</button>
    </div>
  );
}
