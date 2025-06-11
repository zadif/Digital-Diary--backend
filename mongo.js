import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://zadifmustafa93:${process.env.MONGODB_PASSWORD}@cluster0.868uesb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

async function insertMemory(memoryData) {
  try {
    await client.connect();

    const database = client.db("digitalDiary");
    const collection = database.collection("memories");

    // Add timestamp if not provided
    const memoryWithTimestamp = {
      ...memoryData,
      createdAt: memoryData.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(memoryWithTimestamp);
    console.log(`Memory inserted with ID: ${result.insertedId}`);

    return result;
  } catch (error) {
    console.error("Error inserting memory:", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function getAllMemories() {
  try {
    await client.connect();

    const database = client.db("digitalDiary");
    const collection = database.collection("memories");

    const memories = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return memories;
  } catch (error) {
    console.error("Error fetching memories:", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function deleteMemory(memoryId) {
  try {
    await client.connect();

    const database = client.db("digitalDiary");
    const collection = database.collection("memories");

    // Convert string ID to ObjectId
    const objectId = new ObjectId(memoryId);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 1) {
      return { success: true, deletedCount: result.deletedCount };
    } else {
      console.log(`No memory found with ID: ${memoryId}`);
      return { success: false, deletedCount: 0 };
    }
  } catch (err) {
    console.error("Error deleting memory:", err);
    throw err;
  } finally {
    await client.close();
  }
}

async function updateMemory(memory) {
  try {
    await client.connect();

    const database = client.db("digitalDiary");
    const collection = database.collection("memories");

    // Convert string ID to ObjectId
    const objectId = new ObjectId(memory.objectID);
    const result = await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          title: memory.title,
          content: memory.content,
          updatedAt: new Date(),
        },
      }
    );

    return result;
  } catch (err) {
    console.error("Error updating memory:", err);
    throw err;
  } finally {
    await client.close();
  }
}

async function testConnection() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}

// Export functions for use in other files
export {
  connectToMongoDB,
  insertMemory,
  getAllMemories,
  testConnection,
  deleteMemory,
  updateMemory,
};

// Test the connection (comment this out in production)
testConnection().catch(console.dir);
