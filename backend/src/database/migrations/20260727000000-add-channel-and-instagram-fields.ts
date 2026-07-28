import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Whatsapps", "channel", {
      type: DataTypes.STRING,
      defaultValue: "whatsapp",
      allowNull: false
    });
    await queryInterface.addColumn("Whatsapps", "facebookPageUserId", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Whatsapps", "facebookUserToken", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn("Whatsapps", "instagramId", {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Tickets", "channel", {
      type: DataTypes.STRING,
      defaultValue: "whatsapp",
      allowNull: false
    });

    await queryInterface.addColumn("Contacts", "instagramId", {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "channel");
    await queryInterface.removeColumn("Whatsapps", "facebookPageUserId");
    await queryInterface.removeColumn("Whatsapps", "facebookUserToken");
    await queryInterface.removeColumn("Whatsapps", "instagramId");
    await queryInterface.removeColumn("Tickets", "channel");
    await queryInterface.removeColumn("Contacts", "instagramId");
  }
};
