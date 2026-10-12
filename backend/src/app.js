const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const {
    createOpportunity,
    getAllOpportunities,
    getOpportunityById,
    updateOpportunity,
    deleteOpportunity
} = require("./controllers/opportunityController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("University Research Opportunity Portal API is running!");
});

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Express server is working successfully!"
    });
});

app.get("/api/health/db", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok", database: "connected" });
    } catch (error) {
        console.error("Database health check failed:", error);
        res.status(503).json({ status: "error", database: "unavailable" });
    }
});
app.post("/api/opportunities/create", createOpportunity);
app.get("/api/opportunities/all", getAllOpportunities);
app.get("/api/opportunities/:id", getOpportunityById);
app.put("/api/opportunities/update/:id", updateOpportunity);
app.delete("/api/opportunities/:id", deleteOpportunity);
module.exports = app;