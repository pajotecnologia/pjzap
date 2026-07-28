import Flow from "../../models/Flow";

interface Request {
  companyId: number;
}

const ListFlowsService = async ({ companyId }: Request): Promise<Flow[]> => {
  const flows = await Flow.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]]
  });

  return flows;
};

export default ListFlowsService;
