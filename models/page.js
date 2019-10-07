module.exports = (sequelize, datatTypes) => {
  const page = sequelize.define("page", {
    id: { type: datatTypes.STRING, primaryKey: true },
    userId: {
      type: datatTypes.UUID,
      references: {
        model: "users",
        key: "id"
      },
      allowNull: false
    },
    isConnected: {
      type: datatTypes.BOOLEAN,
      defaultValue: false,
      allowNull: null
    }
  });
  return page;
};
