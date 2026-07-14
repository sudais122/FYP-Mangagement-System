import Counter from "../Models/counter.js";

export const generateStudentId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "student" },
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  );

  const number = String(counter.value).padStart(4, "0");
  const year = new Date().getFullYear();

  return `STD-${year}${number}`;
};
