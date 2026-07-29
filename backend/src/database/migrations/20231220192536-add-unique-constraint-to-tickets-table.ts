import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.removeConstraint("Tickets", "contactid_companyid_unique");
    } catch (e) {
      // Ignore if constraint does not exist
    }
    try {
      await queryInterface.addConstraint("Tickets", ["contactId", "companyId", "whatsappId"], {
        type: "unique",
        name: "contactid_companyid_unique"
      });
    } catch (e) {
      // Ignore if constraint already exists
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.removeConstraint(
        "Tickets",
        "contactid_companyid_unique"
      );
    } catch (e) {
      // Ignore
    }
  }
};
