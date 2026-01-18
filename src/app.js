import express from "express";
import spacesRoutes from "./routes/spaces.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/spaces", spacesRoutes);
app.use("/events", eventsRoutes);

app.use(errorHandler);

export default app;
