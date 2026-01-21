const express = require("express");
const spacesRoutes = require("./routes/spaces.routes");
const eventsRoutes = require("./routes/events.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/spaces", spacesRoutes);
app.use("/events", eventsRoutes);

app.use(errorHandler);

module.exports = app;
