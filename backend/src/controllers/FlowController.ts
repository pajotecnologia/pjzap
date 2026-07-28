import { Request, Response } from "express";
import CreateFlowService from "../services/FlowServices/CreateFlowService";
import ListFlowsService from "../services/FlowServices/ListFlowsService";
import ShowFlowService from "../services/FlowServices/ShowFlowService";
import UpdateFlowService from "../services/FlowServices/UpdateFlowService";
import DeleteFlowService from "../services/FlowServices/DeleteFlowService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const flows = await ListFlowsService({ companyId });
  return res.status(200).json(flows);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, nodes, connections, active } = req.body;

  const flow = await CreateFlowService({
    name,
    nodes,
    connections,
    active,
    companyId
  });

  return res.status(201).json(flow);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;

  const flow = await ShowFlowService({ id: flowId, companyId });
  return res.status(200).json(flow);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;
  const flowData = req.body;

  const flow = await UpdateFlowService({
    flowData,
    id: flowId,
    companyId
  });

  return res.status(200).json(flow);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;

  await DeleteFlowService({ id: flowId, companyId });
  return res.status(200).json({ message: "Flow deleted" });
};
