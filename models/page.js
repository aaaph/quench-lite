module.exports = (sequelize, datatTypes) => {
  const page = sequelize.define("page", {
    id: { type: datatTypes.STRING, primaryKey: true },
    isConnected: {
      type: datatTypes.BOOLEAN,
      defaultValue: false,
      allowNull: null
    }
  });
  return page;
};
