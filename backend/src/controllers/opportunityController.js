const prisma = require("../config/prisma");

const normalizeList = (value) => {
    const values = Array.isArray(value)
        ? value
        : typeof value === "string"
            ? value.split(",")
            : [];

    return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
};

const opportunityDiscoveryFields = (body) => {
    const skills = normalizeList(body.skills ?? body.required_skills);
    const keywords = normalizeList(
        body.keywords ?? [body.research_area, ...skills]
    );
    const mode = body.mode || "on-campus";

    if (typeof (body.paid ?? false) !== "boolean") {
        return { error: "Paid must be a boolean." };
    }
    if (!["remote", "on-campus"].includes(mode)) {
        return { error: "Mode must be remote or on-campus." };
    }

    return {
        paid: body.paid ?? false,
        mode,
        skills,
        keywords,
        requiredSkills: skills.join(", ")
    };
};

const createOpportunity = async (req, res) => {
    try {
        const {
            title,
            description,
            research_area,
            faculty_name,
            department,
            required_skills,
            available_positions,
            application_deadline,
            status
        } = req.body;
        const discoveryFields = opportunityDiscoveryFields(req.body);

        if (discoveryFields.error) {
            return res.status(400).json({ message: discoveryFields.error });
        }

        // Check required fields
        if (
            !title ||
            !description ||
            !research_area ||
            !faculty_name ||
            !department ||
            !required_skills ||
            available_positions === undefined ||
            available_positions === null ||
            !application_deadline
        ) {
            return res.status(400).json({
                message: "All required fields must be provided."
            });
        }

        // Validate available positions
        if (
            !Number.isInteger(available_positions) ||
            available_positions < 0
        ) {
            return res.status(400).json({
                message: "Available positions must be a non-negative integer."
            });
        }

        // Validate status
        const opportunityStatus = status || "Open";

        if (!["Open", "Closed"].includes(opportunityStatus)) {
            return res.status(400).json({
                message: "Status must be Open or Closed."
            });
        }

        const opportunities = await prisma.$queryRaw`
            INSERT INTO research_opportunities (
                title,
                description,
                research_area,
                faculty_name,
                department,
                required_skills,
                available_positions,
                application_deadline,
                status,
                paid,
                mode,
                skills,
                keywords
            )
            VALUES (
                ${title},
                ${description},
                ${research_area},
                ${faculty_name},
                ${department},
                ${discoveryFields.requiredSkills || required_skills},
                ${available_positions},
                CAST(${application_deadline} AS DATE),
                ${opportunityStatus},
                ${discoveryFields.paid},
                ${discoveryFields.mode},
                CAST(${JSON.stringify(discoveryFields.skills)} AS JSONB),
                CAST(${JSON.stringify(discoveryFields.keywords)} AS JSONB)
            )
            RETURNING *;
        `;

        return res.status(201).json({
            message: "Research opportunity created successfully.",
            opportunity: opportunities[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};
// READ: Get all research opportunities
const getAllOpportunities = async (req, res) => {
    try {
        const opportunities = await prisma.$queryRaw`
            SELECT *
            FROM research_opportunities
            ORDER BY id ASC
        `;

        return res.status(200).json({
            message: "Research opportunities retrieved successfully",
            total: opportunities.length,
            opportunities
        });

    } catch (error) {
        console.error("Error fetching opportunities:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
// READ: Get one research opportunity by ID
const getOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid opportunity ID"
            });
        }

        const opportunities = await prisma.$queryRaw`
            SELECT *
            FROM research_opportunities
            WHERE id = ${Number(id)}
        `;

        // Check if opportunity exists
        if (opportunities.length === 0) {
            return res.status(404).json({
                message: "Research opportunity not found"
            });
        }

        res.status(200).json({
            message: "Research opportunity retrieved successfully",
            opportunity: opportunities[0]
        });

    } catch (error) {
        console.error("Error fetching opportunity:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is valid
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid opportunity ID"
            });
        }

        const {
            title,
            description,
            research_area,
            faculty_name,
            department,
            required_skills,
            available_positions,
            application_deadline,
            status
        } = req.body;
        const discoveryFields = opportunityDiscoveryFields(req.body);

        if (discoveryFields.error) {
            return res.status(400).json({ message: discoveryFields.error });
        }

        // Check required fields
        if (
            !title ||
            !description ||
            !research_area ||
            !faculty_name ||
            !department ||
            !required_skills ||
            available_positions === undefined ||
            available_positions === null ||
            !application_deadline ||
            !status
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate available positions
        if (
            !Number.isInteger(available_positions) ||
            available_positions < 0
        ) {
            return res.status(400).json({
                message: "Available positions must be a non-negative integer"
            });
        }

        // Validate status
        if (!["Open", "Closed"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Open or Closed"
            });
        }

        const opportunities = await prisma.$queryRaw`
            UPDATE research_opportunities
            SET
                title = ${title},
                description = ${description},
                research_area = ${research_area},
                faculty_name = ${faculty_name},
                department = ${department},
                required_skills = ${discoveryFields.requiredSkills || required_skills},
                available_positions = ${available_positions},
                application_deadline = CAST(${application_deadline} AS DATE),
                status = ${status},
                paid = ${discoveryFields.paid},
                mode = ${discoveryFields.mode},
                skills = CAST(${JSON.stringify(discoveryFields.skills)} AS JSONB),
                keywords = CAST(${JSON.stringify(discoveryFields.keywords)} AS JSONB)
            WHERE id = ${Number(id)}
            RETURNING *
        `;

        if (opportunities.length === 0) {
            return res.status(404).json({
                message: "Research opportunity not found"
            });
        }

        return res.status(200).json({
            message: "Research opportunity updated successfully",
            opportunity: opportunities[0]
        });

    } catch (error) {
        console.error("Error updating opportunity:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const deleteOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is valid
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid opportunity ID"
            });
        }

        // Delete the opportunity from the database
        const opportunities = await prisma.$queryRaw`
            DELETE FROM research_opportunities
            WHERE id = ${Number(id)}
            RETURNING *
        `;

        // Check if opportunity exists
        if (opportunities.length === 0) {
            return res.status(404).json({
                message: "Research opportunity not found"
            });
        }

        // Return success response
        return res.status(200).json({
            message: "Research opportunity deleted successfully",
            opportunity: opportunities[0]
        });

    } catch (error) {
        console.error("Error deleting opportunity:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};



module.exports = {
    createOpportunity,
    getAllOpportunities,
    getOpportunityById,
    updateOpportunity,
    deleteOpportunity
};
