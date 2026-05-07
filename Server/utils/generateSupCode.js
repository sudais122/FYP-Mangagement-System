import Counter from "../Models/counter.js";

export const generateSupCode = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "supervisor" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.value).padStart(5, "0");
  return `SUP-2026${number}`;
};