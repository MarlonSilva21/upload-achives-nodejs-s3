require('dotenv').config(); //for node to read the environment variables from the .env file

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

/**
 * Database setup
 */
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
});

app.use(cors());
app.use(express.json()); //for the application to be able to handle the message body coming in JSON format
app.use(express.urlencoded({ extended:  true }));  //for the application to handle requests in the URL Encoded pattern
app.use(morgan('dev')) //requisition log lib
app.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))); //releasing access to static files

app.use(require('./routes'))

app.listen(3000)
