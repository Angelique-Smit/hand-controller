const nn = ml5.neuralNetwork({ task: 'classification', debug: true })

document.getElementById("train").addEventListener("click", fetchTrainingData);
ml5.setBackend("webgl");
function fetchTrainingData() {
  fetch("./learndata2.json")
      .then((res) => res.json())
      .then((data) => trainAI(data))
}

async function trainAI(data) {

let useThisData = data.data;

  for (let i=0; i < useThisData.length; i++) {
      let singlePose = useThisData[i];
      let label = singlePose.label

      nn.addData(singlePose.vector, { label })
  }

    const trainingOptions = {
      epochs: 28,
      learningRate: 0.4,
      hiddenUnits: 200,
    }

  nn.normalizeData()
  await nn.train(trainingOptions, () => finishedTraining())
}

async function finishedTraining(){
  console.log("Finished training!")
}
  
//alles uit de app.js dat belangrijk is voor dit

import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
  
  const demosSection = document.getElementById("demos");
  
  let handLandmarker = undefined;
  let runningMode = "IMAGE";
  let enableWebcamButton;
  let webcamRunning = false;

  
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
    canvasElement.style.width = video.videoWidth;
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

// Now onto the actual guessing of the pose/hand (I called it label for short)

document.getElementById("label").addEventListener("click", capturePose);

async function guessLabel (labelThis) {
    if (!labelThis) {
        const errorMessage = "No vector data has been found. Please try again."
        console.warn(errorMessage);
    }

    let prediction = await nn.classify(labelThis.vector);
    console.log(prediction)
    console.log(prediction[0].label)
    console.log(prediction[0].confidence)

}

function convertPoseToVector(pose) {
    return pose
      .map((point) => {
        return [point.x, point.y];
      })
      .flat();
}

function capturePose() {
    if (!results) {
        const errorMessage = "No visible pose detected. Please make sure to enable your webcam before you try to save a pose";
        console.warn(errorMessage);
    }

    const labelThis = {
        vector: convertPoseToVector(results.landmarks[0]),
    };

    console.log(labelThis.vector)

    guessLabel(labelThis);
}

document.getElementById("saveModel").addEventListener("click", saveModel);

function saveModel () {
  nn.save()
  //"model", () => console.log("model was saved!")
}

document.getElementById("test").addEventListener("click", fetchTest);

function fetchTest() {
  fetch("./testdata2.json")
      .then((res) => res.json())
      .then((data) => testModel(data))
}

async function testModel(data) {
  let useThisData = data.data;
  let totalGuesses = data.data.length
  let goodGuesses = 0;
  let badGuesses = 0;
  let badGuessesIndexNumbers = [];
  let badGuessesPoses = [];
  

  for (let i=0; i < useThisData.length; i++) {
      let singlePose = useThisData[i];
      let prediction = await nn.classify(singlePose.vector)
      // Turned off to prevent console spam
      // console.log(prediction[0].label)
      // console.log(prediction[0].confidence)
      // console.log(prediction)

      if (singlePose.label == prediction[0].label) {
        goodGuesses++
      } else {
        badGuesses++
        let badGuessIndex = i
        let badGuessLabel = singlePose.label
        badGuessesIndexNumbers.push(badGuessIndex);
        badGuessesPoses.push(badGuessLabel);
      }
  }

  finishedTesting(goodGuesses, badGuesses, totalGuesses, badGuessesIndexNumbers, badGuessesPoses)
}

function finishedTesting(goodGuesses, badGuesses, totalGuesses, badGuessesIndexNumbers, badGuessesPoses) {
  let accuracy = goodGuesses/totalGuesses * 100
  console.log("Finished training! This model is " + accuracy + "%" + " accurate with a total guesses of:" + totalGuesses + " Good guesses: " + goodGuesses + " Bad guesses " + badGuesses)
  console.log("The index numbers it got wrong in testing were:" + badGuessesIndexNumbers)
  console.log("The poses it got wrong in testing were:" + badGuessesPoses)
}