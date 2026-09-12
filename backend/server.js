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

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SatQuery AI backend is running"
  });
});

setInterval(() => { }, 1000);

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
      (error) =>
        console.error("Earth Engine initialization failed:", error)
    );
  },
  (error) =>
    console.error("Earth Engine authentication failed:", error)
);


/* =========================================================
   IMAGE ANALYSIS
========================================================= */

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


/* =========================================================
   IMAGE COMPARISON
========================================================= */

app.post(
  "/api/compare",

  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 }
  ]),

  async (req, res) => {

    let image1Path = null;
    let image2Path = null;

    try {

      const image1 = req.files?.image1?.[0];
      const image2 = req.files?.image2?.[0];

      const question =
        req.body.question ||
        "Compare these two satellite images and identify the major changes.";

      if (!image1 || !image2) {
        return res.status(400).json({
          success: false,
          error: "Please upload both images."
        });
      }

      image1Path = image1.path;
      image2Path = image2.path;

      const imageData1 = fs
        .readFileSync(image1.path)
        .toString("base64");

      const imageData2 = fs
        .readFileSync(image2.path)
        .toString("base64");

      console.log(
        "Sending two images to Gemini for comparison..."
      );

      let response = null;
      let lastError = null;

      // Retry temporary Gemini 503 errors
      for (let attempt = 1; attempt <= 3; attempt++) {

        try {

          console.log(
            `Gemini comparison attempt ${attempt}/3...`
          );

          response = await ai.models.generateContent({

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

Image 1 is the earlier/reference image.
Image 2 is the later/comparison image.

Compare both satellite images carefully.

User question:
${question}

Analyze visually supported changes in:

- Vegetation
- Water bodies
- Buildings
- Roads
- Urban development
- Agriculture
- Bare land
- Other visible land-cover features

Clearly explain:

1. Major changes between Image 1 and Image 2
2. Where the changes appear
3. Whether vegetation increased or decreased
4. Whether water presence increased or decreased
5. Whether built-up areas increased or decreased
6. Other important observations
7. Uncertainty or limitations

Do not invent changes that cannot be visually supported.

Give the final answer in a clear, structured format.`
              }

            ]

          });

          console.log(
            "Gemini comparison response received."
          );

          break;

        } catch (error) {

          lastError = error;

          console.error(
            `Gemini comparison attempt ${attempt} failed:`,
            error.message
          );

          const errorText = String(
            error.message || ""
          ).toLowerCase();

          const temporaryError =
            errorText.includes("503") ||
            errorText.includes("unavailable") ||
            errorText.includes("high demand") ||
            errorText.includes("temporarily");

          if (!temporaryError || attempt === 3) {
            throw error;
          }

          console.log(
            `Gemini temporarily unavailable. Retrying in ${attempt * 3
            } seconds...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, attempt * 3000)
          );
        }
      }

      if (!response) {
        throw (
          lastError ||
          new Error("No response received from Gemini.")
        );
      }

      res.json({
        success: true,
        answer: response.text
      });

    } catch (error) {

      console.error(
        "Gemini comparison error:",
        error
      );

      const errorText = String(
        error.message || ""
      ).toLowerCase();

      if (
        errorText.includes("503") ||
        errorText.includes("unavailable") ||
        errorText.includes("high demand")
      ) {

        return res.status(503).json({
          success: false,
          error:
            "The AI comparison service is temporarily unavailable because the Gemini model is experiencing high demand. Please try again in a moment."
        });

      }

      res.status(500).json({
        success: false,
        error:
          "Unable to compare the images. Please try again."
      });

    } finally {

      // Delete temporary uploaded files

      try {

        if (
          image1Path &&
          fs.existsSync(image1Path)
        ) {
          fs.unlinkSync(image1Path);
        }

        if (
          image2Path &&
          fs.existsSync(image2Path)
        ) {
          fs.unlinkSync(image2Path);
        }

      } catch (cleanupError) {

        console.error(
          "Temporary file cleanup error:",
          cleanupError
        );

      }
    }
  }
);


/* =========================================================
   REMOTE SENSING INDICES
========================================================= */

app.get("/api/indices", async (req, res) => {

  try {

    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    const startDate = req.query.start;
    const endDate = req.query.end;

    // Validate location

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {

      return res.status(400).json({
        success: false,
        error: "Invalid latitude or longitude."
      });

    }

    // Validate dates

    if (!startDate || !endDate) {

      return res.status(400).json({
        success: false,
        error: "Start date and end date are required."
      });

    }

    if (new Date(startDate) >= new Date(endDate)) {

      return res.status(400).json({
        success: false,
        error: "End date must be after start date."
      });

    }

    const point = ee.Geometry.Point([
      lon,
      lat
    ]);

    const collection = ee
      .ImageCollection(
        "COPERNICUS/S2_SR_HARMONIZED"
      )

      .filterDate(
        startDate,
        endDate
      )

      .filterBounds(point)

      .filter(
        ee.Filter.lt(
          "CLOUDY_PIXEL_PERCENTAGE",
          20
        )
      );

    // Check whether satellite images exist

    const imageCount = await new Promise(
      (resolve, reject) => {

        collection
          .size()
          .evaluate(
            (count, error) => {

              if (error) {
                reject(error);
              } else {
                resolve(count);
              }

            }
          );

      }
    );

    if (!imageCount || imageCount === 0) {

      return res.status(404).json({
        success: false,
        error:
          "No suitable Sentinel-2 satellite images were found for this location and date range. Try another date range."
      });

    }

    const image = collection.median();

    // NDVI = vegetation

    const ndvi = image
      .normalizedDifference([
        "B8",
        "B4"
      ])
      .rename("NDVI");

    // NDWI = water

    const ndwi = image
      .normalizedDifference([
        "B3",
        "B8"
      ])
      .rename("NDWI");

    // NDBI = built-up areas

    const ndbi = image
      .normalizedDifference([
        "B11",
        "B8"
      ])
      .rename("NDBI");

    const indices = ndvi
      .addBands(ndwi)
      .addBands(ndbi);

    const result = await new Promise(
      (resolve, reject) => {

        indices.reduceRegion({

          reducer:
            ee.Reducer.mean(),

          geometry:
            point.buffer(5000),

          scale: 10,

          maxPixels: 1e9

        })

          .evaluate(
            (data, error) => {

              if (error) {
                reject(error);
              } else {
                resolve(data);
              }

            }
          );

      }
    );

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

      imageCount: imageCount,

      indices: result

    });

  } catch (error) {

    console.error(
      "Earth Engine error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Earth Engine analysis failed."
    });

  }

});


/* =========================================================
   REGISTER
========================================================= */

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email and password are required."
      });
    }

    // Clean input
    name = name.trim();
    email = email.trim().toLowerCase();

    // Validate name
    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Name must contain at least 2 characters."
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address."
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must contain at least 6 characters."
      });
    }

    console.log("Registration request received for:", email);

    // Check whether email already exists
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      console.log("Registration rejected: email already exists:", email);

      return res.status(409).json({
        success: false,
        error: "An account with this email already exists."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password)
       VALUES (?, ?, ?)`,
      [name, email, hashedPassword]
    );

    console.log(
      "Registration successful. User ID:",
      result.insertId
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      userId: result.insertId
    });

  } catch (error) {
    console.error("========== REGISTRATION ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL State:", error.sqlState);
    console.error("Full error:", error);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      error: "Registration failed. Please try again."
    });
  }
});


/* =========================================================
   LOGIN
========================================================= */

app.post("/api/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    if (
      !email ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Email and password are required."
      });

    }

    const [users] =
      await db.execute(

        "SELECT id, name, email, password FROM users WHERE email = ?",

        [email]

      );

    if (users.length === 0) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password."
      });

    }

    const user = users[0];

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password."
      });

    }

    res.json({

      success: true,

      message:
        "Login successful.",

      user: {

        id: user.id,

        name: user.name,

        email: user.email

      }

    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Login failed. Please try again."

    });

  }

});


/* =========================================================
   TEXT-ONLY AI ASSISTANT + SAVE HISTORY
========================================================= */

app.post("/api/chat", async (req, res) => {

  try {

    const {
      question,
      userId
    } = req.body;

    // Validate question

    if (
      !question ||
      !question.trim()
    ) {

      return res.status(400).json({

        success: false,

        error:
          "Question is required."

      });

    }

    // Validate user

    const numericUserId =
      Number(userId);

    if (
      !Number.isInteger(
        numericUserId
      )
    ) {

      return res.status(400).json({

        success: false,

        error:
          "Valid user ID is required. Please login again."

      });

    }

    console.log(
      `AI Assistant request from user ${numericUserId}`
    );

    // Generate AI response

    const response =
      await ai.models.generateContent({

        model:
          "gemini-3.6-flash",

        contents: [

          {

            role: "user",

            parts: [

              {

                text: `You are SatQuery AI, an intelligent assistant specializing in remote sensing, satellite imagery, Earth observation, geospatial analysis, and artificial intelligence.

Answer the user's question clearly and accurately.

User question:
${question}`

              }

            ]

          }

        ]

      });

    const answer =
      response.text;

    // Save question and answer to history

    try {

      await db.execute(

        `INSERT INTO history
        (user_id, activity_type, question, result)
        VALUES (?, ?, ?, ?)`,

        [

          numericUserId,

          "AI Assistant",

          question.trim(),

          answer

        ]

      );

      console.log(
        `AI Assistant history saved for user ${numericUserId}`
      );

    } catch (historyError) {

      // Do not fail the AI response if history saving fails

      console.error(
        "History save error:",
        historyError
      );

    }

    // Return AI response

    res.json({

      success: true,

      answer: answer

    });

  } catch (error) {

    console.error(
      "Chat error:",
      error
    );

    res.status(500).json({

      success: false,

      error:
        error.message ||
        "Unable to generate AI response."

    });

  }

});


/* =========================================================
   DATASET SCENES
========================================================= */

app.get(
  "/api/dataset/scenes",
  async (req, res) => {

    try {

      const fs =
        await import("fs/promises");

      const path =
        await import("path");

      const {
        fileURLToPath
      } = await import("url");

      const __filename =
        fileURLToPath(
          import.meta.url
        );

      const __dirname =
        path.dirname(
          __filename
        );

      const scenesPath =
        path.join(

          __dirname,

          "SatQuery_Dataset",

          "scenes"

        );

      const sceneFolders =
        await fs.readdir(
          scenesPath,
          {
            withFileTypes: true
          }
        );

      const scenes = [];

      for (
        const folder
        of sceneFolders
      ) {

        if (
          !folder.isDirectory()
        ) {
          continue;
        }

        const metadataPath =
          path.join(

            scenesPath,

            folder.name,

            "metadata.json"

          );

        try {

          const metadata =
            JSON.parse(

              await fs.readFile(
                metadataPath,
                "utf-8"
              )

            );

          scenes.push({

            scene_id:
              folder.name,

            metadata

          });

        } catch {

          // Ignore folders without valid metadata

        }

      }

      res.json({

        success: true,

        count:
          scenes.length,

        scenes

      });

    } catch (error) {

      console.error(
        "Dataset scenes error:",
        error
      );

      res.status(500).json({

        success: false,

        error:
          "Unable to load dataset scenes."

      });

    }

  }
);


/* =========================================================
   DATASET ANALYSIS
========================================================= */

app.get(
  "/api/dataset/analyze/:sceneId",
  async (req, res) => {

    try {

      const fs =
        await import("fs/promises");

      const path =
        await import("path");

      const {
        fileURLToPath
      } = await import("url");

      const GeoTIFF =
        await import("geotiff");

      const __filename =
        fileURLToPath(
          import.meta.url
        );

      const __dirname =
        path.dirname(
          __filename
        );

      const sceneId =
        req.params.sceneId;

      const scenePath =
        path.join(

          __dirname,

          "SatQuery_Dataset",

          "scenes",

          sceneId

        );

      const metadataPath =
        path.join(

          scenePath,

          "metadata.json"

        );

      const metadata =
        JSON.parse(

          await fs.readFile(
            metadataPath,
            "utf-8"
          )

        );

      async function readBand(
        filename
      ) {

        const filePath =
          path.join(

            scenePath,

            filename

          );

        const tiff =
          await GeoTIFF.fromFile(
            filePath
          );

        const image =
          await tiff.getImage();

        const data =
          await image.readRasters({

            interleave:
              true

          });

        return {

          data:
            data,

          width:
            image.getWidth(),

          height:
            image.getHeight()

        };

      }

      const green =
        await readBand(
          "B03.tif"
        );

      const red =
        await readBand(
          "B04.tif"
        );

      const nir =
        await readBand(
          "B08.tif"
        );

      const swir =
        await readBand(
          "B11.tif"
        );

      const pixelCount =
        green.data.length;

      const ndvi =
        new Array(
          pixelCount
        );

      const ndwi =
        new Array(
          pixelCount
        );

      const ndbi =
        new Array(
          pixelCount
        );

      for (
        let i = 0;
        i < pixelCount;
        i++
      ) {

        const g =
          Number(
            green.data[i]
          );

        const r =
          Number(
            red.data[i]
          );

        const n =
          Number(
            nir.data[i]
          );

        const s =
          Number(
            swir.data[i]
          );

        ndvi[i] =
          n + r !== 0
            ? (n - r) /
            (n + r)
            : 0;

        ndwi[i] =
          g + n !== 0
            ? (g - n) /
            (g + n)
            : 0;

        ndbi[i] =
          s + n !== 0
            ? (s - n) /
            (s + n)
            : 0;

      }

      function statistics(
        values
      ) {

        const valid =
          values.filter(
            Number.isFinite
          );

        const min =
          Math.min(
            ...valid
          );

        const max =
          Math.max(
            ...valid
          );

        const mean =
          valid.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          ) /
          valid.length;

        return {

          min,

          max,

          mean

        };

      }

      res.json({

        success: true,

        scene: {

          id:
            sceneId,

          metadata

        },

        dimensions: {

          width:
            green.width,

          height:
            green.height

        },

        indices: {

          NDVI: {

            statistics:
              statistics(
                ndvi
              ),

            values:
              ndvi

          },

          NDWI: {

            statistics:
              statistics(
                ndwi
              ),

            values:
              ndwi

          },

          NDBI: {

            statistics:
              statistics(
                ndbi
              ),

            values:
              ndbi

          }

        }

      });

    } catch (error) {

      console.error(
        "Dataset analysis error:",
        error
      );

      res.status(500).json({

        success: false,

        error:
          error.message ||
          "Dataset analysis failed."

      });

    }

  }
);


/* =========================================================
   GET USER HISTORY
========================================================= */

app.get(
  "/api/history/:userId",
  async (req, res) => {

    try {

      const userId =
        Number(
          req.params.userId
        );

      if (
        !Number.isInteger(
          userId
        )
      ) {

        return res.status(400).json({

          success: false,

          error:
            "Invalid user ID."

        });

      }

      const [history] =
        await db.execute(

          `SELECT
            id,
            activity_type,
            question,
            result,
            created_at
           FROM history
           WHERE user_id = ?
           ORDER BY created_at DESC`,

          [userId]

        );

      res.json({

        success: true,

        history

      });

    } catch (error) {

      console.error(
        "History fetch error:",
        error
      );

      res.status(500).json({

        success: false,

        error:
          "Unable to load history."

      });

    }

  }
);


/* =========================================================
   START SERVER
========================================================= */

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);