const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const router = express.Router();
const { Image } = require('../model'); // Adjust the import based on your model's path

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Directory for saving uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save with the original file name
  }
});
const upload = multer({ storage });

// POST route to upload an image with optional compression
router.post('/upload', upload.single('image'), async (req, res) => {
  // router.post('/upload', upload.array('images', 10), async (req, res) => { // 10 is the maximum number of files
  try {
    const { originalname, path: filePath } = req.file;

    // const imagesData = [];

    // for (const file of req.files) {
    //   const { originalname, path: filePath } = file;

    // Compressed file path with the original extension
    const compressedFilePath = path.join(uploadDir, `compressed_${originalname}`);

    // Compress image while keeping the original extension
    const extension = path.extname(originalname).toLowerCase();
    const sharpInstance = sharp(filePath).resize({ width: 1920, height: 1080 }); // Resize if needed

    // Apply format-specific options
    if (extension === '.jpeg' || extension === '.jpg') {
      sharpInstance.jpeg({ quality: 50 });
    } else if (extension === '.png') {
      sharpInstance.png({ quality: 50 });
    } else if (extension === '.webp') {
      sharpInstance.webp({ quality: 50 });
    } else if (extension === '.avif') {
      sharpInstance.avif({ quality: 50 });
    }

    await sharpInstance.toFile(compressedFilePath);

    // Save only the compressed image's relative path to the database


const image = await Image.create({
  name: originalname,
  data: `compressed_${originalname}` // Save the relative path
});
    res.status(201).json({ message: "Image uploaded and compressed successfully", image });

    // imagesData.push(image); // Collect image data for response
  
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});


// GET route to retrieve images as HTML
router.get('/images', async (req, res) => {
  try {
    const images = await Image.findAll();

    // Generate HTML for the images
    const imageHtml = images.map(image => {
      return `<div style="display: inline-block; margin: 35px; text-align: center;">
                <h3>${image.name}</h3>
                <img src="/uploads/${image.data}" alt="${image.name}" style="max-width: 500px;"/>
              </div>`;
    }).join('');

    // Send the HTML response
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Images</title>
           <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .image-gallery {
              display: flex;
              flex-wrap: wrap;
              gap: 30px;
              justify-content: flex-start;
            }
          </style>
      </head>
      <body>
          <h1>Images</h1>
          <div>${imageHtml}</div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error retrieving images:", error);
    res.status(500).send("Failed to retrieve images");
  }
});


// GET route to retrieve an image by ID
router.get('/images/:id', async (req, res) => {
  try {
    const imageId = req.params.id;

    // Fetch the image record by primary key (ID)
    const image = await Image.findByPk(imageId);

    // Check if the image was found
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Ensure image.data is a string
    if (typeof image.data !== 'string') {
      throw new Error("Image data is not a string");
    }

    // Construct the path to the image file
    const imagePath = path.join(uploadDir, image.data);

    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image file not found" });
    }

    // Set the content type based on the file extension
    const extension = path.extname(image.data).toLowerCase();
    let contentType = 'image/jpeg'; // Default content type

    if (extension === '.png') {
      contentType = 'image/png';
    } else if (extension === '.webp') {
      contentType = 'image/webp';
    } else if (extension === '.avif') {
      contentType = 'image/avif';
    }

    // Send the image file as a response
    res.set('Content-Type', contentType);
    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).json({ error: "Failed to retrieve image" });
  }
});

router.delete('/images/:id', async (req, res) => {
  try {
    const imageId = req.params.id;

    // Fetch the image record by primary key (ID)
    const image = await Image.findByPk(imageId);

    // Check if the image was found
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Ensure `image.data` is a string (which should be the filename in your case)
    if (typeof image.data !== 'string') {
      throw new Error("Image data is not a string");
    }

    // Construct the path to the image file
    const imagePath = path.join(uploadDir, image.data);

    // Check if the file exists and delete it
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete the file from the filesystem
    }

    // Delete the image record from the database
    await image.destroy();

    // Send success response
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});



module.exports = router;
