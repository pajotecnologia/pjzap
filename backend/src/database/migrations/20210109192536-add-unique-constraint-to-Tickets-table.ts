import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.addConstraint("Tickets", ["contactId", "companyId"], {
        type: "unique",
        name: "contactid_companyid_unique"
      });
    } catch (e) {
      console.log("Migration notice (20210109192536): constraint already exists, skipping.");
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
