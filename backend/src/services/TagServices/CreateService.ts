import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface Request {
  name: string;
  color: string;
  kanban: number;
  companyId: number;
  msgMsg?: string;
  flowId?: number;
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  kanban = 0,
  companyId,
  msgMsg = null,
  flowId = null
}: Request): Promise<Tag> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const [tag] = await Tag.findOrCreate({
    where: { name, color, companyId, kanban, msgMsg, flowId },
    defaults: { name, color, companyId, kanban, msgMsg, flowId }
  });

  await tag.reload();

  return tag;
};

export default CreateService;
