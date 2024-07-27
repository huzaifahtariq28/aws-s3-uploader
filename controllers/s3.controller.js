const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { File } = require('../models/file.model');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const uploadFile = async (filePath, subFolderName, fileName) => {
  const fileContent = await fs.readFile(filePath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${subFolderName}/${fileName}`,
    Body: fileContent,
  };

  return s3.upload(params).promise();
};

const processFolder = async (folderPath) => {
  const subFolderName = path.basename(folderPath);
  const files = await fs.readdir(folderPath);
  const fileRecords = [];

  for (const fileName of files) {
    const filePath = path.join(folderPath, fileName);
    const fileUuid = uuidv4();

    try {
      const uploadResult = await uploadFile(filePath, subFolderName, fileName);
      fileRecords.push({
        uuid: fileUuid,
        subFolderName,
        fileName,
        s3Url: uploadResult.Location,
      });
      console.log(`Uploaded ${fileName} to ${uploadResult.Location}`);
    } catch (error) {
      console.error(`Error uploading ${fileName}:`, error);
    }
  }

  return fileRecords;
};

const uploadFolders = async (rootFolder) => {
  const subFolders = await fs.readdir(rootFolder);
  const directories = await Promise.all(
    subFolders.map(async (file) => {
      const filePath = path.join(rootFolder, file);
      const stats = await fs.lstat(filePath);
      return stats.isDirectory() ? file : null;
    })
  );

  let allFileRecords = [];
  for (const subFolder of directories.filter(Boolean)) {
    const folderPath = path.join(rootFolder, subFolder);
    const fileRecords = await processFolder(folderPath);
    allFileRecords = allFileRecords.concat(fileRecords);
  }

  try {
    if (allFileRecords.length > 0) {
      await File.bulkCreate(allFileRecords);
      console.log('Successfully inserted records into the database.');
    }
  } catch (error) {
    console.error('Error inserting records into the database:', error);
  }
};

module.exports = {
  uploadFolders,
};
