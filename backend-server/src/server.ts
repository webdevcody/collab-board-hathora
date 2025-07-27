import "dotenv/config";
import express from "express";
import router from "./router.ts";

const app = express();
app.use(express.json());

// Mount centralized router
app.use("/api", router);

const port = process.env.PORT ?? 8080;
app.listen(port).once("listening", () => {
  console.log(`Listening on *:${port}`);
});
