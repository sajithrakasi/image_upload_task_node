
const express = require('express');
const bodyParser = require('body-parser');
const imageRoute = require('./route/imageRoute'); // Adjust the import path as needed
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
// app.use('/api/uploads', express.static('uploads')); //http://localhost:3000/api/uploads/rose.jpg , http://localhost:3000/api/uploads/compressed_birds.jpg

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', imageRoute); // Use your image routes  

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views')); // Adjust the path to your views directory


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
