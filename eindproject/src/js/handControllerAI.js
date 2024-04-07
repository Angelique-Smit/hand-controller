import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";


// EXCALIBURRRRRRRRRRRR, EXCALIBURRRRRRRRRRRRRR From the United Kingdom! I'm looking for heaven! I'm going to California!

  
  const demosSection = document.getElementById("demos");
  
  let handLandmarker = undefined;
  let runningMode = "IMAGE";
  let enableWebcamButton;
  let webcamRunning = false;

  const nn = ml5.neuralNetwork({ task: 'classification', debug: true })
  const modelDetails = {
    model: './model/model.json',
    metadata: './model/model_meta.json',
    weights: './model/model.weights.bin'
  }
  nn.load(modelDetails, () => {
    console.log("het model is geladen pookie!")
  })
  
  const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks( "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: runningMode,
      numHands: 1
    });
    demosSection.classList.remove("invisible");
  };
  createHandLandmarker();
  
  const imageContainers = document.getElementsByClassName("detectOnClick");

  for (let i = 0; i < imageContainers.length; i++) {
    imageContainers[i].children[0].addEventListener("click", handleClick);
  }
  
  async function handleClick(event) {
    if (!handLandmarker) {
      console.log("Wait for handLandmarker to load before clicking!");
      return;
    }
  
    if (runningMode === "VIDEO") {
      runningMode = "IMAGE";
      await handLandmarker.setOptions({ runningMode: "IMAGE" });
    }

    const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
    for (var i = allCanvas.length - 1; i >= 0; i--) {
      const n = allCanvas[i];
      n.parentNode.removeChild(n);
    }
  
    const handLandmarkerResult = handLandmarker.detect(event.target);
    console.log(handLandmarkerResult.handednesses[0][0]);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style =
      "left: 0px;" +
      "top: 0px;" +
      "width: " +
      event.target.width +
      "px;" +
      "height: " +
      event.target.height +
      "px;";
  
    event.target.parentNode.appendChild(canvas);
    const cxt = canvas.getContext("2d");
    for (const landmarks of handLandmarkerResult.landmarks) {
      drawConnectors(cxt, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5
      });
      drawLandmarks(cxt, landmarks, { color: "#FF0000", lineWidth: 1 });
    }
  }
  
  const video = document.getElementById("webcam");
  const canvasElement = document.getElementById("output_canvas");
  const canvasCtx = canvasElement.getContext("2d");
  
  const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
  
  if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }
  
  function enableCam(event) {
    if (!handLandmarker) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }
  
    if (webcamRunning === true) {
      webcamRunning = false;
      enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    } else {
      webcamRunning = true;
      enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
  
    const constraints = {
      video: true
    };
  
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }
  
  let lastVideoTime = -1;
  let results = undefined;
  console.log(video);
  async function predictWebcam() {
    canvasElement.style.width = video.videoWidth;;
    canvasElement.style.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      results = handLandmarker.detectForVideo(video, startTimeMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2
        });

        // for (const markPosition of landmarks) {
        //     handCollection.push(markPosition.x, + markPosition.y)
        // }
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        }

    }
    canvasCtx.restore();
  
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }

async function guessLabel (labelThis) {
  if (!labelThis) {
      const errorMessage = "No vector data has been found. Please try again."
      console.warn(errorMessage);
      return null; 
  }

  let prediction = await nn.classify(labelThis.vector);
  // console.log(prediction)
  // console.log(prediction[0].label)
  // console.log(prediction[0].confidence)

  let label = prediction[0].label
  // console.log("label")
  // console.log(label)
  return label; 
}

function convertPoseToVector(pose) {
  return pose
    .map((point) => {
      return [point.x, point.y];
    })
    .flat();
}

async function capturePose() {
  if (!results) {
      const errorMessage = "No visible pose detected. Please make sure to enable your webcam before you try to save a pose";
      console.warn(errorMessage);
      return; 
  }

  const labelThis = {
      vector: convertPoseToVector(results.landmarks[0]),
  };

  console.log(labelThis.vector)

  let label = await guessLabel(labelThis);
  console.log(label)
  return label;
}

export { guessLabel, capturePose };
