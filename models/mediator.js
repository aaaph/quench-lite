module.exports = (sequelize, dataTypes) => {
  const mediator = sequelize.define("mediator", {
    tagId: {
      type: dataTypes.UUID,
      references: {
        model: "tags",
        key: "id"
      },
      allowNull: false
    },
    pageId: {
      type: dataTypes.STRING,
      references: {
        model: "pages",
        key: "id"
      },
      allowNull: false
    }
  });
  return mediator;
};
