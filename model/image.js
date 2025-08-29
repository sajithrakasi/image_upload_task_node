const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Image extends Model {}

  Image.init({
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.STRING, // Use STRING to store the file path
      allowNull: false,
    },
  }, {
    sequelize, // Pass sequelize instance here
    modelName: 'Images', // Name of the model
    tableName: 'Images', // Name of the table
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  });

  return Image;
};
