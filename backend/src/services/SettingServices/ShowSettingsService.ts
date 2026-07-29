import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Request {
  settingKey: string; // Add settingKey property
  companyId: number;
}

const ShowSettingsService = async ({
  settingKey,
  companyId
}: Request): Promise<Setting | any> => {
  try {
    const setting = await Setting.findOne({
      where: { key: settingKey, companyId }
    });

    if (!setting) {
      return { key: settingKey, value: "disabled" };
    }

    return setting;
  } catch (error) {
    return { key: settingKey, value: "disabled" };
  }
};

export default ShowSettingsService;