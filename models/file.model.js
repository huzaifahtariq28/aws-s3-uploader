const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../startup/db');

class File extends Model {}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    subFolderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    s3Url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    modifiedTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'File',
    tableName: 'files',
    timestamps: false,
  }
);

module.exports = { File };
