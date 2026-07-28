import Flow from "../../models/Flow";
import AppError from "../../errors/AppError";

interface Request {
  id: number | string;
  companyId: number;
}

const DeleteFlowService = async ({ id, companyId }: Request): Promise<void> => {
  const flow = await Flow.findOne({
    where: { id, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado.", 404);
  }

  await flow.destroy();
};

export default DeleteFlowService;
