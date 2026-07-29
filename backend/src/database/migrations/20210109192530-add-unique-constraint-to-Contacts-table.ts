import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.addConstraint("Contacts", ["number", "companyId"], {
        type: "unique",
        name: "number_companyid_unique"
      });
    } catch (e) {
      // Ignore if constraint already exists
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.removeConstraint(
        "Contacts",
        "number_companyid_unique"
      );
    } catch (e) {
      // Ignore
    }
  }
};
