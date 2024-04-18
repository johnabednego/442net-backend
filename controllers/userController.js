const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const faceapi = require('face-api.js');
const { faceDetectionOptions } = require('../utils/faceApiCommons');
const canvas = require('canvas');


// Patching the environment for face-api.js
faceapi.env.monkeyPatch({
    Canvas: canvas.Canvas,
    Image: canvas.Image,
    ImageData: canvas.ImageData
});

// Generate JWT including the token version
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion }, 
    authConfig.jwtSecret, 
    { expiresIn: '1h' }
  );
};

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, country, stateRegion, city, role, image } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    if (!image) {
      return res.status(400).json({ message: 'Facial image is required' });
    }

    // Assuming image is a URL or a base64 string that needs to be loaded
    const img = new canvas.Image();
    img.onload = async () => {
      try {
        // Create a canvas from the loaded image
        const current_canvas = faceapi.createCanvasFromMedia(img);
        const detection = await faceapi.detectSingleFace(current_canvas).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
          return res.status(400).json({ message: 'Could not process facial features' });
        }

        // Now you can store the descriptor in your database
        const facialDescriptors = detection.descriptor;

        // Create the user with the facial descriptor
        const user = new User({
          firstName, lastName, email, password, // Ensure password is hashed before saving
          phoneNumber, country, stateRegion, city, role,
          facialDescriptors: Array.from(facialDescriptors)  // Convert Float32Array to regular array
        });

        await user.save();

        res.status(201).json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          token: generateToken(user)
        });
      } catch (innerError) {
        console.error(innerError);
        res.status(500).json({ message: innerError.message });
      }
    };

    img.onerror = err => {
      throw err;
    };

    // Set the source of the image, which triggers the onload or onerror event
    if (image.startsWith('http')) {
      img.src = image;  // If image is a URL
    } else {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      img.src = buffer;  // If image is a base64 string
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Update the token version and save the user before generating a new token
      user.tokenVersion++;
      await user.save();

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user)
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.facialLogin = async (req, res) => {
  const { image } = req.body;

  if (!image) {
      return res.status(400).json({ message: "Facial image is required." });
  }

  try {
      const img = new canvas.Image();
      img.onload = async () => {
          try {
              const current_canvas = faceapi.createCanvasFromMedia(img);
              const detection = await faceapi.detectSingleFace(current_canvas, faceDetectionOptions).withFaceLandmarks().withFaceDescriptor();

              if (!detection) {
                  return res.status(400).json({ message: "No face detected." });
              }

              const faceDescriptors = detection.descriptor;
              const queryDescriptor = new Float32Array(Object.values(faceDescriptors));

              const users = await User.find();
              let closestMatch = null;
              let minimumDistance = Infinity;

              users.forEach(user => {
                  const dbDescriptor = new Float32Array(user.facialDescriptors);
                  const distance = faceapi.euclideanDistance(dbDescriptor, queryDescriptor);
                  if (distance < minimumDistance) {
                      minimumDistance = distance;
                      closestMatch = user;
                  }
              });

              if (closestMatch && minimumDistance <= 0.6) { // Threshold can be adjusted
                  closestMatch.tokenVersion++;
                  await closestMatch.save();
                  const token = generateToken(closestMatch);

                  res.json({
                      _id: closestMatch._id,
                      firstName: closestMatch.firstName,
                      lastName: closestMatch.lastName,
                      email: closestMatch.email,
                      phoneNumber: closestMatch.phoneNumber,
                      role: closestMatch.role,
                      token: token
                  });
              } else {
                  res.status(401).json({ message: "Authentication failed. No matching face found." });
              }
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: "Error processing the image.", error: error.toString() });
          }
      };

      img.onerror = err => {
          console.error(err);
          res.status(500).json({ message: "Error loading the image.", error: err.toString() });
      };

      // Set the source of the image
      if (image.startsWith('http')) {
          img.src = image;
      } else {
          const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          img.src = buffer;
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error during facial recognition login.", error: error.toString() });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { _id, firstName, lastName, email, role } = await User.findById(req.user.id);

    res.json({
      id: _id,
      firstName,
      lastName,
      email,
      role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
