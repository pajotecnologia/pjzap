import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const updateText = `🚀 Lançada a Versão 7.0.0 do PJZap!

Confira as novidades e melhorias implementadas:

1. 🤖 FlowBuilder Avançado:
- Novos nós: Webhook (HTTP POST), Atraso (Delay), Sorteio (Randomizador A/B), Cobrança Pix e Troca de Kanban.
- Execução autônoma integrada ao WhatsApp e Instagram Direct.
- Layout responsivo compactado com auto-enquadramento (fitView).
- Remoção simplificada de conexões com clique na linha ou Delete.

2. 📊 Kanban CRM & Dashboard Financeiro:
- Gatilho automático de envio de mensagem ou disparo de fluxo do FlowBuilder ao mover o card para a coluna.
- Métricas de faturamento e ticket médio calculados por coluna do Kanban.
- Captura e exibição das origens de tráfego (UTMs) no card do Lead.

3. 💬 Central de Atendimento Multicanal:
- Identificação visual dos canais (WhatsApp e Instagram) + Nome da Conexão nos cards de ticket.
- Transferência de tickets aperfeiçoada com mudança para aba Pendente, desvinculação imediata do atendente anterior e notificações via WebSockets.
- Sanitização de arquivos de mídia de até 50MB.

4. 💳 Campanhas de Disparo em Massa:
- Suporte a criação de campanhas a partir de Tags do Kanban ou Listas de Contatos.
- Validação estrita de Conexão WhatsApp.

5. 🎨 Branding & Customização:
- Personalização de logotipos, temas, cores e tamanho de fonte global.`;

    try {
      await queryInterface.bulkInsert("Announcements", [
        {
          priority: 1,
          title: "🎉 Novidades da Versão 7.0.0 - PJZap",
          text: updateText,
          status: true,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } catch (e) {}
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.bulkDelete("Announcements", {
        title: "🎉 Novidades da Versão 7.0.0 - PJZap"
      });
    } catch (e) {}
  }
};
