import { Store } from '../models/store.js';

export const getSettings = (req, res) => {
  const settings = Store.getSettings();
  res.json({ success: true, data: settings });
};

export const updateSettings = (req, res) => {
  const current = Store.getSettings();
  const updated = {
    ...current,
    ...req.body,
  };
  Store.saveSettings(updated);
  res.json({ success: true, data: updated });
};
