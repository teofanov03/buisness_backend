import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" } // možeš imati i "user" ako želiš kasnije
});

export default mongoose.model("User", UserSchema);
