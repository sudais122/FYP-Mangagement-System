import Deadline from "../Models/deadline.js";

export const createDeadline = async (req, res) => {
  try {
    const { type, customName, description, dueDate } = req.body;
    const date = new Date(dueDate);
    date.setHours(23, 59, 0, 0); // auto 11:59 PM
    const deadline = await Deadline.create({ type, customName, description, dueDate: date, createdBy: req.user.id });
    res.status(201).json({ message: "Deadline created", deadline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllDeadlines = async (req, res) => {
  try {
    const deadlines = await Deadline.find().sort({ dueDate: 1 });
    res.json(deadlines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDeadline = async (req, res) => {
  try {
    const { type, customName, description, dueDate } = req.body;
    const date = new Date(dueDate);
    date.setHours(23, 59, 0, 0);
    const deadline = await Deadline.findByIdAndUpdate(
      req.params.id,
      { type, customName, description, dueDate: date },
      { new: true }
    );
    if (!deadline) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated", deadline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDeadline = async (req, res) => {
  try {
    await Deadline.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};