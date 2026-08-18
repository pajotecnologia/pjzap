import QueueIntegrations from "../../models/QueueIntegrations";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

const DeleteQueueIntegrationService = async (id: string): Promise<void> => {
  const dialogflow = await QueueIntegrations.findOne({
    where: { id }
  });

  if (!dialogflow) {
    throw new AppError("ERR_NO_DIALOG_FOUND", 404);
  }

  // Desvincular das filas para evitar erro de constraint de chave estrangeira
  try {
    await Queue.update(
      { integrationId: null },
      { where: { integrationId: id } }
    );
  } catch (e) {}

  // Desvincular de tickets ativos
  try {
    await Ticket.update(
      { integrationId: null, useIntegration: false },
      { where: { integrationId: id } }
    );
  } catch (e) {}

  await dialogflow.destroy();
};

export default DeleteQueueIntegrationService;