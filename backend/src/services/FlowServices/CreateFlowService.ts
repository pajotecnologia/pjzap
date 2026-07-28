import Flow from "../../models/Flow";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  nodes?: string;
  connections?: string;
  active?: boolean;
  companyId: number;
}

const CreateFlowService = async ({
  name,
  nodes = "[]",
  connections = "[]",
  active = true,
  companyId
}: Request): Promise<Flow> => {
  if (!name) {
    throw new AppError("O nome do fluxo é obrigatório");
  }

  const flow = await Flow.create({
    name,
    nodes: typeof nodes === "string" ? nodes : JSON.stringify(nodes),
    connections: typeof connections === "string" ? connections : JSON.stringify(connections),
    active,
    companyId
  });

  return flow;
};

export default CreateFlowService;
