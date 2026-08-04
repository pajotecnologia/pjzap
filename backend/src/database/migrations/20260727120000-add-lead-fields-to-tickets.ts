import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.addColumn("Tickets", "leadValue", {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn("Tickets", "leadTemperature", {
        type: DataTypes.ENUM("hot", "warm", "cold"),
        allowNull: true,
        defaultValue: null,
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn("Tickets", "leadOrigin", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn("Tickets", "leadClosedAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn("Tickets", "isLead", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    } catch (e) {}
  },

  down: async (queryInterface: QueryInterface) => {
    try { await queryInterface.removeColumn("Tickets", "leadValue"); } catch (e) {}
    try { await queryInterface.removeColumn("Tickets", "leadTemperature"); } catch (e) {}
    try { await queryInterface.removeColumn("Tickets", "leadOrigin"); } catch (e) {}
    try { await queryInterface.removeColumn("Tickets", "leadClosedAt"); } catch (e) {}
    try { await queryInterface.removeColumn("Tickets", "isLead"); } catch (e) {}
  },
};
