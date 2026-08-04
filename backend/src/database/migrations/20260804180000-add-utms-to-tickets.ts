import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.addColumn("Tickets", "utmSource", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn("Tickets", "utmMedium", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn("Tickets", "utmCampaign", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      });
    } catch (e) {}
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.removeColumn("Tickets", "utmSource");
    } catch (e) {}
    try {
      await queryInterface.removeColumn("Tickets", "utmMedium");
    } catch (e) {}
    try {
      await queryInterface.removeColumn("Tickets", "utmCampaign");
    } catch (e) {}
  }
};
