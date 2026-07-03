import "dotenv/config";
import app from "./app.js";

const PORT = process.env.BETTER_AUTH_URL;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on ${PORT}`);
});