require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await prisma.$connect();
        console.log("Connected to PostgreSQL successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("PostgreSQL connection failed during server startup:", error);
        process.exitCode = 1;
    }
}

startServer();