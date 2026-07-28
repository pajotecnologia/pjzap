import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn(
        "Tickets",
        "leadValue",
        {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: null,
        },
        { transaction: t }
      );
      await queryInterface.addColumn(
        "Tickets",
        "leadTemperature",
        {
          type: DataTypes.ENUM("hot", "warm", "cold"),
          allowNull: true,
          defaultValue: null,
        },
        { transaction: t }
      );
      await queryInterface.addColumn(
        "Tickets",
        "leadOrigin",
        {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        { transaction: t }
      );
      await queryInterface.addColumn(
        "Tickets",
        "leadClosedAt",
        {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        { transaction: t }
      );
      await queryInterface.addColumn(
        "Tickets",
        "isLead",
        {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction: t }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn("Tickets", "leadValue", { transaction: t });
      await queryInterface.removeColumn("Tickets", "leadTemperature", { transaction: t });
      await queryInterface.removeColumn("Tickets", "leadOrigin", { transaction: t });
      await queryInterface.removeColumn("Tickets", "leadClosedAt", { transaction: t });
      await queryInterface.removeColumn("Tickets", "isLead", { transaction: t });
    });
  },
};
