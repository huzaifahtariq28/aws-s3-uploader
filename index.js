const path = require('path');
const { connectToDB } = require('./startup/db');
const { uploadFolders } = require('./controllers/s3.controller');

connectToDB();

const rootFolder = path.join(__dirname, 'data');

if (rootFolder) uploadFolders(rootFolder).catch(console.error);
