const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("whaticket_afcode", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const Flow = sequelize.define(
  "Flow",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    nodes: DataTypes.TEXT,
    connections: DataTypes.TEXT,
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    companyId: DataTypes.INTEGER,
  },
  { tableName: "Flows" }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado ao banco de dados.");

    // Verifica fluxos existentes
    const existing = await Flow.findAll();
    if (existing.length > 0) {
      console.log("\nFluxos já existentes:");
      existing.forEach((f) => console.log(`  - ID: ${f.id} | Nome: ${f.name} | Empresa: ${f.companyId}`));
      console.log("\nOs fluxos acima já devem aparecer no seletor.");
    } else {
      // Cria fluxo de exemplo
      const flow = await Flow.create({
        name: "Atendimento Automático",
        nodes: JSON.stringify([
          { id: "1", type: "trigger", keyword: "oi", title: "Início" },
          { id: "2", type: "message", content: "Olá! Bem-vindo. Como posso ajudar?", title: "Boas-vindas" },
          { id: "3", type: "menu", content: "Escolha uma opção:", title: "Menu", options: [
            { id: "opt1", optionNumber: "1", text: "Suporte", targetNodeId: "4" },
            { id: "opt2", optionNumber: "2", text: "Comercial", targetNodeId: "5" },
          ]},
          { id: "4", type: "transfer_queue", queueId: 1, title: "Transferir Suporte" },
          { id: "5", type: "transfer_queue", queueId: 2, title: "Transferir Comercial" },
        ]),
        connections: JSON.stringify([
          { sourceNodeId: "1", targetNodeId: "2" },
          { sourceNodeId: "2", targetNodeId: "3" },
        ]),
        active: true,
        companyId: 1,
      });
      console.log(`\nFluxo criado com sucesso! ID: ${flow.id} | Nome: ${flow.name}`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("Erro:", err.message);
    process.exit(1);
  }
})();
