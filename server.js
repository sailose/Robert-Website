const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
// Route for handling the contact form submission
// ...

// Route for handling the contact form submission
app.post('/submit-form', (req, res) => {
  const { name, email, message } = req.body;

  // Send email using Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'FastFireDefense@gmail.com',
      pass: 'iumx vros iamc xwyp'
    }
  });

  const mailOptions = {
    from: email,
    to: 'FastFireDefense@gmail.com',
    subject: 'New Contact Form Submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent successfully:', info.response);
      // Redirect the user to the home page after sending the email
      res.setHeader('Location', '/');
      res.status(302).send();
    }
  });
});

// ...

// Rest of your code...

// Route for serving the contact.html file
app.get('/contact.html', (req, res) => {
  const filePath = './Robby website/contact.html';
  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.error('Error reading file:', error);
      res.status(500).send('Error reading file');
    } else {
      res.send(data.toString());
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

