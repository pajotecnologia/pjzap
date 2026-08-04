import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tags", "msgMsg", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
    
    await queryInterface.addColumn("Tags", "flowId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tags", "msgMsg");
    await queryInterface.removeColumn("Tags", "flowId");
  }
};
