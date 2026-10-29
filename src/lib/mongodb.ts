import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailureTime?: number;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined in environment variables. Please check your .env.local file."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  // Fast offline guard: if offline connection failed within the last 15s, don't stall the request
  if (cached.lastFailureTime && Date.now() - cached.lastFailureTime < 15000) {
    throw new Error("MongoDB is offline or unreachable (offline cooldown active)");
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 1200,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      cached.lastFailureTime = undefined;
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.lastFailureTime = Date.now();
    throw e;
  }

  return cached.conn;
}
