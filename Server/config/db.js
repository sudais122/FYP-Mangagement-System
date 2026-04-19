import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Drop old indexes once connection is open
    const collection = mongoose.connection.db.collection("users");
    const indexes = await collection.indexes();
    for (let index of indexes) {
      if (index.name === "reg_no_1" || index.name === "student_code_1") {
        await collection.dropIndex(index.name);
        console.log("Dropped old index:", index.name);
      }
    }
  } catch (err) {
    console.log("Mongo Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;