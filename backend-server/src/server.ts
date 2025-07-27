import "dotenv/config";
import express from "express";
import router from "./router.ts";
import { errorHandlerMiddleware } from "./utils/errorHandler.ts";

const app = express();

// Enable Express 5.x async error handling
app.use(express.json());

// Mount centralized router
app.use("/api", router);

// Global error handling middleware (must be last)
// Express 5.x automatically catches async errors!
app.use(errorHandlerMiddleware);

const port = process.env.PORT ?? 8080;
app.listen(port).once("listening", () => {
  console.log(`Listening on *:${port}`);
});
