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
  const setting = await Setting.findOne({
    where: { key: settingKey, companyId }
  });

  if (!setting) {
    if (settingKey === "viewregister") {
      return { key: "viewregister", value: "disabled" };
    }
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  return setting;
};

export default ShowSettingsService;