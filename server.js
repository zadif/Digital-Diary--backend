import express from "express";
import cors from "cors";
import {
  insertMemory,
  getAllMemories,
  deleteMemory,
  updateMemory,
} from "./mongo.js";

const app = express();

// Middleware - order matters!
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Digital Diary API");
});

// API Routes
app.get("/memories", async (req, res) => {
  try {
    const memories = await getAllMemories();
    res.json(memories);
  } catch (error) {
    console.error("Error fetching memories:", error);
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

app.post("/memories", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
        received: { title, content },
      });
    }

    const memoryData = {
      title,
      content,
      createdAt: new Date(),
    };

    const result = await insertMemory(memoryData);
    res.status(201).json({
      message: "Memory saved successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving memory:", error);
    res.status(500).json({ error: "Failed to save memory" });
  }
});

app.put("/memories", async (req, res) => {
  try {
    let { objectID, title, content } = req.body;

    if (!title || !content || !objectID) {
      return res.status(400).json({
        error: "Title and content are required in put request",
        received: { title, content },
      });
    }
    const memoryObj = {
      objectID,
      title,
      content,
    };

    const result = await updateMemory(memoryObj);
    res.status(201).json({
      message: "Memory updated successfully",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Error updating memory:", err);
    res.status(500).json({ error: "Failed to update memory" });
  }
});

app.delete("/memories", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    const result = await deleteMemory(id);

    if (result.success && result.deletedCount === 1) {
      res.status(200).json({ message: "Memory deleted successfully" });
    } else {
      res.status(404).json({ error: "Memory not found" });
    }
  } catch (err) {
    console.error("Error deleting memory:", err);
    res.status(500).json({ error: "Failed to delete memory" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080 and accessible on local network");
});
