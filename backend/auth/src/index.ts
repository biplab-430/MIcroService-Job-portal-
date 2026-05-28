import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { sql } from "./utilis/db.js";
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .connect()
  .then(() => console.log("💚 connected to redis"))
  .catch((error) => {
    console.error("❌ Redis connection failed:", error);
  });

async function initDb() {
  try {
    // ================= ENUMS =================

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'user_role'
        ) THEN
          CREATE TYPE user_role AS ENUM (
            'jobseeker',
            'recruiter'
          );
        END IF;
      END $$;
    `;

    // ================= USERS TABLE =================

    await sql`
      CREATE TABLE IF NOT EXISTS users(
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        role user_role NOT NULL,

        bio TEXT,

        resume VARCHAR(255),
        resume_public_id VARCHAR(255),

        profile_pic VARCHAR(255),
        profile_pic_public_id VARCHAR(255),

        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

        subscription TIMESTAMPTZ
      )
    `;

    // ================= SKILLS TABLE =================

    await sql`
      CREATE TABLE IF NOT EXISTS skills(
        skill_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `;

    // ================= USER SKILLS TABLE =================

    await sql`
      CREATE TABLE IF NOT EXISTS user_skills(
        user_id INTEGER NOT NULL
          REFERENCES users(user_id)
          ON DELETE CASCADE,

        skill_id INTEGER NOT NULL
          REFERENCES skills(skill_id)
          ON DELETE CASCADE,

        PRIMARY KEY (user_id, skill_id)
      )
    `;

    // ================= FOLLOWERS TABLE =================

    await sql`
      CREATE TABLE IF NOT EXISTS followers(
        follower_id INTEGER NOT NULL
          REFERENCES users(user_id)
          ON DELETE CASCADE,

        following_id INTEGER NOT NULL
          REFERENCES users(user_id)
          ON DELETE CASCADE,

        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (follower_id, following_id),

        CHECK (follower_id != following_id)
      )
    `;

    // ================= FOLLOWERS INDEXES =================

    await sql`
      CREATE INDEX IF NOT EXISTS idx_followers_follower_id
      ON followers(follower_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_followers_following_id
      ON followers(following_id)
    `;

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

initDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(
      `Auth service is running on http://localhost:${process.env.PORT}`
    );
  });
});