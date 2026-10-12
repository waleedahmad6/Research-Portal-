const express = require("express");
const router = express.Router();

const {
    createOpportunity,
    getAllOpportunities,
    getOpportunityById,
    updateOpportunity,
    deleteOpportunity
} = require("../controllers/opportunityController");

// API 1: Create an opportunity
router.post("/create", createOpportunity);

// API 2: Get all opportunities
router.get("/all", getAllOpportunities);

// API 3: Get one opportunity by ID
router.get("/:id", getOpportunityById);

// API 4: Update an opportunity
router.put("/update/:id", updateOpportunity);

router.delete("/:id", deleteOpportunity);
module.exports = router;