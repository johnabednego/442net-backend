// faceApiCommons.js
const faceapi = require('face-api.js');
const path = require('path');

// Load models and export setup function
async function loadModels() {
  const modelsPath = path.resolve(__dirname, 'models');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
}

const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

module.exports = { loadModels, faceDetectionOptions };
