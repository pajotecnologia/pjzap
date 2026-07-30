import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table: any = await queryInterface.describeTable("Prompts");

    if (!table.provider) {
      await queryInterface.addColumn("Prompts", "provider", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "openai"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const table: any = await queryInterface.describeTable("Prompts");

    if (table.provider) {
      await queryInterface.removeColumn("Prompts", "provider");
    }
  }
};
