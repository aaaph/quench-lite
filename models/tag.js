module.exports = (sequelize, dataTypes) => {
  const tag = sequelize.define("tag", {
    id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV1,
      primaryKey: true
    },
    type: {
      type: dataTypes.UUID,
      allowNull: false,
      references: {
        model: "tagTypes",
        key: "id"
      }
    },
    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    description: {
      type: dataTypes.STRING,
      allowNull: false
    },
    isSupervisor: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    pages: {
      type: dataTypes.INTEGER,
      defaultValue: 0
    }
  });

  return tag;
};
