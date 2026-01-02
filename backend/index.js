// index.js – Backend Server (Local + Docker Execution Support)
// -------------------------------------------------------------
// NOTE FOR FUTURE:
// To enable Docker execution:
//   1. Install Docker Desktop
//   2. Build all images listed in runDocker.js header comments
//   3. Then from frontend, switch executionMode = "docker"
//   4. Everything will work out-of-the-box.

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import prettier from "prettier";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";

import { runLocal } from "./src/runLocal.js";
import { runDocker } from "./src/runDocker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));



// SIMPLE TEST
app.get("/api", (req, res) => {
    res.send("Backend is running...");
});

// ----------------------
// LOCAL EXECUTION
// ----------------------
app.post("/api/run/local", async (req, res) => {
    logRequest(req);
    const { language, code, stdin } = req.body;

    try {
        const result = await runLocal(language, code, stdin || "");
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: String(err) });
    }
});

// ----------------------
// DOCKER EXECUTION
// ----------------------
app.post("/api/run/docker", async (req, res) => {
    logRequest(req);
    const { language, code, stdin } = req.body;

    try {
        const result = await runDocker(language, code, stdin || "");
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: String(err) });
    }
});

app.get("/api/problems-meta", (req, res) => {
    logRequest(req);
    const basePath = path.join(__dirname, "data");

    const difficulties = fs.readdirSync(basePath)
        .filter((d) => fs.statSync(path.join(basePath, d)).isDirectory());

    const output = [];

    for (const diff of difficulties) {
        const diffPath = path.join(basePath, diff);
        const categories = fs.readdirSync(diffPath)
            .filter((c) => fs.statSync(path.join(diffPath, c)).isDirectory());

        const categoryList = [];

        for (const cat of categories) {
            const categoryPath = path.join(diffPath, cat);

            // All JSON files inside category
            const problems = fs.readdirSync(categoryPath)
                .filter((file) => file.endsWith(".json"))
                .map((file, index) => ({
                    id: index + 1,
                    name: file.replace(".json", "").trim(),
                    file: file
                }));

            categoryList.push({
                category: cat,
                problems
            });
        }

        output.push({
            difficulty: diff,
            categories: categoryList
        });
    }

    res.json(output);
});

// ------------------------------------------------------------------
// API 2: RETURN ACTUAL FULL PROBLEM JSON
// ------------------------------------------------------------------
app.get("/api/problem", (req, res) => {
    logRequest(req);
    const { difficulty, category, file } = req.query;

    if (!difficulty || !category || !file) {
        return res.status(400).json({
            error: "Missing query params: difficulty, category, file"
        });
    }

    const filePath = path.join(__dirname, "data", difficulty, category, file);

    console.log("File Path" + filePath);


    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Problem file not found." });
    }

    try {
        const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
        res.json(json);
    } catch (err) {
        res.status(500).json({ error: "Failed to parse JSON file." });
    }
});


app.post("/api/prettify-code", async (req, res) => {
    logRequest(req);

    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).json({
            success: false,
            error: "language and code are required",
        });
    }

    try {
        // ---------------- JAVASCRIPT ----------------
        if (language === "javascript") {
            const formattedCode = await prettier.format(code, {
                parser: "babel",
                semi: true,
                singleQuote: false,
                tabWidth: 4,
                trailingComma: "es5",
            });

            return res.json({ success: true, language, formattedCode });
        }

        // Temp file handling
        const tempId = uuid();
        const tempDir = "/tmp";
        let filePath, formatCmd;

        // ---------------- PYTHON ----------------
        if (language === "python") {
            filePath = path.join(tempDir, `${tempId}.py`);
            fs.writeFileSync(filePath, code);
            formatCmd = `black ${filePath} --quiet`;
        }

        // ---------------- JAVA ----------------
        else if (language === "java") {
            filePath = path.join(tempDir, "Main.java");
            fs.writeFileSync(filePath, code);
            formatCmd = `java -jar /usr/local/bin/google-java-format.jar --replace ${filePath}`;
        }

        // ---------------- C++ ----------------
        else if (language === "cpp") {
            filePath = path.join(tempDir, `${tempId}.cpp`);
            fs.writeFileSync(filePath, code);
            formatCmd = `clang-format -i ${filePath}`;
        }

        // ---------------- UNSUPPORTED ----------------
        else {
            return res.json({
                success: true,
                language,
                formattedCode: code,
                note: "Formatting not supported for this language",
            });
        }

        // Execute formatter
        exec(formatCmd, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message,
                });
            }

            const formattedCode = fs.readFileSync(filePath, "utf8");
            fs.unlinkSync(filePath);

            return res.json({
                success: true,
                language,
                formattedCode,
            });
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});


app.post("/api/add-problem", async (req, res) => {
    logRequest(req)
    try {
        // await sleep(5 * 1000)
        const data = req.body;

        const {
            Level,
            Category,
            ProblemName
        } = data;

        if (!Level || !Category || !ProblemName) {
            return res.status(400).json({
                error: "Level, Category and ProblemName are required"
            });
        }

        // Base directory (you can rename "data" if you want)
        const BASE_DIR = path.join(process.cwd(), "data");

        // Target directory: /data/Level/Category
        const targetDir = path.join(BASE_DIR, Level, Category);

        // Ensure directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Read existing files to determine next serial
        const files = fs.readdirSync(targetDir);

        const serials = files
            .map(file => {
                const match = file.match(/^(\d+)\./);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter(Boolean);

        const nextSerial = serials.length > 0
            ? Math.max(...serials) + 1
            : 1;

        // Sanitize problem name for filename
        const safeProblemName = ProblemName
            .replace(/[^a-zA-Z0-9-_ ]/g, "")
            .trim()
            .replace(/\s+/g, "_");

        const fileName = `${nextSerial}. ${safeProblemName}.json`;
        const filePath = path.join(targetDir, fileName);

        console.log(fileName);


        // Update serial in payload (overwrite incoming serial)
        const finalPayload = {
            ...data,
            Serial: nextSerial
        };

        // Write JSON file
        fs.writeFileSync(
            filePath,
            JSON.stringify(finalPayload, null, 4),
            "utf-8"
        );

        return res.status(201).json({
            message: "Problem added successfully",
            serial: nextSerial,
            path: `/data/${Level}/${Category}/${fileName}`
        });

    } catch (err) {
        console.error("Add problem error:", err);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function logRequest(req) {
    console.log(`${req.url}`);
}


// Start server
app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
