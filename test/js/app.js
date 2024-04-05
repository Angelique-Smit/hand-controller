//AI KNN
import kNear from "./knear.js"

const k = 3;
const machine = new kNear(k);

document.getElementById("train").addEventListener("click", fetchTrainingData);

function fetchTrainingData() {
    fetch("testdata.json")
        .then((res) => res.json())
        .then((data) => trainAI(data))
}

async function trainAI(data) {
    console.log(data)
    for (let i=0; i < data.length; i++) {
        let singlePose = data[i];

        for (let j=0; j < singlePose.vector.length; j++) {
            machine.learn(singlePose.vector[j], singlePose.label)
        }
    }
}
  