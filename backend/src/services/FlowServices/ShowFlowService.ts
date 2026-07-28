import Flow from "../../models/Flow";
import AppError from "../../errors/AppError";

interface Request {
  id: number | string;
  companyId: number;
}

const ShowFlowService = async ({ id, companyId }: Request): Promise<Flow> => {
  const flow = await Flow.findOne({
    where: { id, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado.", 404);
  }

  return flow;
};

export default ShowFlowService;
