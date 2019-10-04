module.exports = (sequelize, dataTypes) => {
  const attribute = sequelize.define("attribute", {
    id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV1,
      primaryKey: true
    },
    pageId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    type: {
      type: dataTypes.UUID,
      allowNull: false,
      references: {
        model: "attributeTypes",
        key: "id"
      }
    },
    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    description: {
      type: dataTypes.TEXT,
      allowNull: false
    },
    url: {
      type: dataTypes.STRING(300),
      allowNull: false
    }
  });
  return attribute;
};
