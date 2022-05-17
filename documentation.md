### How to reduce Data from Scanned Documents with Nextjs


## Introduction

It is estimated that 66 percent of workers claim their firms have little or no explicit data protection policies or technology in place, despite expanding data privacy requirements for how information is gathered, saved, used, and shared. As a result, most organizations continue to use non-standard techniques to obfuscating content, reliance on manual methods to anonymise sensitive data and thereby nullifying the chance for analysis and insights. This article focuses on achieving one of such methods using Nextjs library. We will focus on data reduction. Where a user will upload a scanned file and redact any words they wish inside the file.


## Codesandbox

Check the sandbox demo on  [Codesandbox](/).

<CodeSandbox
title="webcamtext"
id=" "
/>

You can also get the project github repo using [Github](/).

## Prerequisites

Entry-level javascript and React/Nextjs knowledge.

## Setting Up the Sample Project

Create a new nextjs app using `npx create-next-app imgredact` and head to your terminal: `cd imgredact`
 
We will also include online storage services to store the processed file whenever necessary. We will use [Cloudinary](https://cloudinary.com/?ap=em) to achieve this by including it in the Nextjs serverside backend.  

Use this [link](https://cloudinary.com/console) to create a new account and or log into it. You should see a dashboard once logged in that will contain environment variables necessary for our project backend integration.

In your project dependencies `npm install Cloudinary

Create a new file named `.env.local` in your root directory and paste the following 

```
".env.local"


CLOUDINARY_CLOUD_NAME =

CLOUDINARY_API_KEY =

CLOUDINARY_API_SECRET =
```
 Fill the blanks with your environment variables from the Cloudinary dashboard and restart your project using: `npm run dev`.

Create a new directory named `pages/api/upload.js` and begin by configuring the environment keys and libraries.

```
var cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

Use the Nextjs backend handler function to execute the post request, upload the media file to Cloudinary and decode the texts inside it. The texts will be sent back to the front end as a response to be redacted.

```
export default async function handler(req, res) {
  if (req.method === "POST") {
    // console.log("bakend begins...");
    // Process a POST request
    let response = "";
    try {
      let fileStr = req.body.data;
      console.log("backend received");

      await cloudinary.uploader.upload(
        fileStr,
        { ocr: "adv_ocr" },
        function (error, result) {
          if (error) {
            console.log(error);
          }

          response = result;
          console.log(
            response.info.ocr.adv_ocr.data[0].textAnnotations[0].description
          );
        }
      );
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Something wrong" });
    }

    res
      .status(200)
      .json(response.info.ocr.adv_ocr.data[0].textAnnotations[0].description);
  }
}
```

 

The code above concludes our backend. Let us create the front end. Then

Include html2canvas in your dependencies. We will use it as we move on:
`npm install html2canvas`

In your `pages/index` directory, include the following imports:
```
"pages/index"


import html2canvas from "html2canvas";
import React, { useState, createRef } from "react";

const HTTP_SUCCESS = 200;
```
"pages/index"


Notice the variable `HTTP_SUCCESS`. We wil use iit to determine our successfull API responses.

Declare the following react hooks:

```
"pages/index"


    const [extractText, setExtractText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [cloudinaryResponse, setCloudinaryResponse] = useState("");
    const [image, setImage] = useState();
    const [output, setOutput] = useState();
    const [result, setResult] = useState(false);
    const capture = createRef();

```
Before we continue, fill the return statement with the following. You can get the css files in the Github repo

```
"pages/index"


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
```
When a user first experiences the UI. They will be required to select a scanned document from their local repository.
Create a function `reduceText` that will use a file reader to convert the user's selected media file to base64 and save the encoded image format to the `image` state hook as well as pass it to the `uploadHandler` function.

```
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


  const reduceText = async () => {
    if (selectedFile && extractText) {
      await readFile(selectedFile).then((encoded_file) => {
        setImage(encoded_file);
        uploadHandler(encoded_file);
      });
    }
  };
```
The `uploadHandler` function will upload the encoded fill to Cloudinary and use the `HTTP_SUCCESS` variable created earlier to determine a successful response to receive the image file's encoded texts from the backend. The user will be allowed to specify which words to redact so that they all be replaced with the string `XXX` using `replaceAll()` method. The texts will be assigned to the `cloudinaryResponse` state hook and will also be visible to the user once this is done.

```
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
            setCloudinaryResponse(result.replaceAll(extractText, "XXX"));
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
};
```

We will finally have a function `showOutput` to capture the processed file and show it to the user.

```
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
```

A sample of the UI is as below:

![UI](https://res.cloudinary.com/dogjmmett/image/upload/v1652802182/UI_hlg6oh.png "UI")

That's it! Ensure to go through the article to enjoy the experience.
