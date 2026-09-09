import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import ee from "@google/earthengine";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

dotenv.config();
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

console.log("MySQL connected successfully.");
console.log("API key loaded:", !!process.env.GEMINI_API_KEY);
const app = express();
setInterval(() => {}, 1000);
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.EARTH_ENGINE_KEY_FILE, "utf8")
);

ee.data.authenticateViaPrivateKey(
  serviceAccount,
  () => {
    ee.initialize(
      null,
      null,
      () => console.log("Earth Engine initialized successfully"),
      (error) => console.error("Earth Engine initialization failed:", error)
    );
  },
  (error) => console.error("Earth Engine authentication failed:", error)
);

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const question = req.body.question;

    const imageData = fs.readFileSync(imagePath).toString("base64");
console.log("Sending image to Gemini...");
    const response = await ai.models.generateContent({
      
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: imageData,
          },
        },
        {
          text: `You are SatQuery AI, an intelligent remote-sensing image analysis assistant.

Analyze this satellite image and answer the user's question.

User question:
${question}

Focus on:
- Water bodies
- Vegetation
- Buildings
- Roads
- Urban areas
- Agriculture
- Other visible land-cover features

Give a clear answer and mention uncertainty when something cannot be determined reliably.`,
        },
      ],
    });
    console.log("Gemini response received.");

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      answer: response.text,
    });

  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// Compare two satellite images
app.post(
  "/api/compare",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const image1 = req.files?.image1?.[0];
      const image2 = req.files?.image2?.[0];
      const question = req.body.question;

      if (!image1 || !image2) {
        return res.status(400).json({
          success: false,
          error: "Please upload both images."
        });
      }

      const imageData1 = fs
        .readFileSync(image1.path)
        .toString("base64");

      const imageData2 = fs
        .readFileSync(image2.path)
        .toString("base64");

      console.log("Sending two images to Gemini for comparison...");

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
          {
            inlineData: {
              mimeType: image1.mimetype,
              data: imageData1
            }
          },
          {
            inlineData: {
              mimeType: image2.mimetype,
              data: imageData2
            }
          },
          {
            text: `You are SatQuery AI, an intelligent remote-sensing image comparison assistant.

Compare Image 1 and Image 2 carefully.

User question:
${question || "Compare these two satellite images and identify the major changes."}

Analyze changes in:

- Vegetation
- Water bodies
- Buildings
- Roads
- Urban development
- Agriculture
- Bare land
- Other visible land-cover features

Clearly explain:

1. What changed between Image 1 and Image 2
2. Where the change appears
3. Whether vegetation increased or decreased
4. Whether water presence increased or decreased
5. Whether built-up areas increased or decreased
6. Important observations
7. Any uncertainty or limitation

Do not invent changes that cannot be visually supported.

Give the final answer in a clear, structured format.`
          }
        ]
      });

      console.log("Gemini comparison response received.");

      fs.unlinkSync(image1.path);
      fs.unlinkSync(image2.path);

      res.json({
        success: true,
        answer: response.text
      });

    } catch (error) {
      console.error("Gemini comparison error:", error);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);
app.get("/api/indices", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 16.0;
    const lon = parseFloat(req.query.lon) || 80.0;

    const startDate = req.query.start || "2024-01-01";
    const endDate = req.query.end || "2024-02-01";

    const point = ee.Geometry.Point([lon, lat]);

    const collection = ee.ImageCollection(
      "COPERNICUS/S2_SR_HARMONIZED"
    )
      .filterDate(startDate, endDate)
      .filterBounds(point)
      .filter(
        ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20)
      );

    const image = collection.median();

    const ndvi = image
      .normalizedDifference(["B8", "B4"])
      .rename("NDVI");

    const ndwi = image
      .normalizedDifference(["B3", "B8"])
      .rename("NDWI");

    const ndbi = image
      .normalizedDifference(["B11", "B8"])
      .rename("NDBI");

    const indices = ndvi
      .addBands(ndwi)
      .addBands(ndbi);

    const result = await new Promise((resolve, reject) => {
      indices.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point.buffer(5000),
        scale: 10,
        maxPixels: 1e9
      }).evaluate((data, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

    res.json({
      success: true,

      location: {
        longitude: lon,
        latitude: lat
      },

      dateRange: {
        start: startDate,
        end: endDate
      },

      indices: result
    });

  } catch (error) {
    console.error("Earth Engine error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    // Check if email already exists
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [users] = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});
app.listen(5000, () => {
  console.log("🚀 SatQuery backend running on http://localhost:5000");
});