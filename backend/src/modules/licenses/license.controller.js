import {
  activateExternalLicense,
  createLicense,
  deleteLicense,
  listLicenses,
  rotateActivationKey,
  updateLicense,
  validateExternalLicense
} from "./license.service.js";

export const list = async (req, res) => res.json(await listLicenses(req.query));
export const create = async (req, res) => res.status(201).json(await createLicense(req.body, req.admin.id));
export const update = async (req, res) => res.json({ license: await updateLicense(req.params.id, req.body, req.admin.id) });
export const remove = async (req, res) => {
  await deleteLicense(req.params.id, req.admin.id);
  res.status(204).end();
};
export const rotateKey = async (req, res) => res.json(await rotateActivationKey(req.params.id, req.admin.id));
export const validate = async (req, res) => res.json({ license: await validateExternalLicense(req.body, req.apiClient.id) });
export const activate = async (req, res) => res.json({ license: await activateExternalLicense(req.body, req.apiClient.id) });
