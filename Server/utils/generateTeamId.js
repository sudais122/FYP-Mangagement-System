import Counter from "../Models/counter.js";

export const generateTeamId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "team" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.value).padStart(4, "0");
  const year = new Date().getFullYear();

  return `TEAM-${year}${number}`;
};