import Flow from "../../models/Flow";
import AppError from "../../errors/AppError";

interface RequestData {
  name?: string;
  nodes?: any;
  connections?: any;
  active?: boolean;
}

interface Request {
  flowData: RequestData;
  id: number | string;
  companyId: number;
}

const UpdateFlowService = async ({
  flowData,
  id,
  companyId
}: Request): Promise<Flow> => {
  const flow = await Flow.findOne({
    where: { id, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado.", 404);
  }

  const { name, nodes, connections, active } = flowData;

  await flow.update({
    name: name !== undefined ? name : flow.name,
    nodes: nodes !== undefined ? (typeof nodes === "string" ? nodes : JSON.stringify(nodes)) : flow.nodes,
    connections: connections !== undefined ? (typeof connections === "string" ? connections : JSON.stringify(connections)) : flow.connections,
    active: active !== undefined ? active : flow.active
  });

  return flow;
};

export default UpdateFlowService;
