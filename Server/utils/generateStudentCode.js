import Counter from "../Models/Counter.js";

const generateStudentCode = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { _id: `studentCode_${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNumber = String(counter.seq).padStart(4, "0");
  return `STD${year}${seqNumber}`;
};

export default generateStudentCode;