require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();

const port = process.env.PORT || 8000;

app.use(morgan('tiny'));

app.listen(port, () => console.log(`Listening on ${port}`));