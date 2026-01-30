import "dotenv/config";
import mongoose from "mongoose";
import https from "https";

import User from "../src/models/User.js";
import Post from "../src/models/Post.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ichgramm";

const USERNAME = "itcareerhub";
const CAPTION = "IT Career Hub";
const FILE_IDS = [
  "16bb7YgQ0Mr01Z_NwjqzrHx0EErV2QM6-",
  "1JjuJ88Ock-t2bMXBbXJy4gyczkcgaOu_",
  "1h2fJpeHxW9Uf_P2j9Zz-9l4RcnW6f5uV",
  "1tuJkNtB7HFb8bJtc_Lg6nMVS0VeWd14a",
  "1uOyUexz3RC6-wHh933SlbdPb9qk9f6aZ",
  "1wCUpJb3i_14jHreHrfLXiNeYR1BbN4FL",
];

function downloadUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          redirects < 5
        ) {
          res.resume();
          return resolve(downloadUrl(res.headers.location, redirects + 1));
        }

        if (res.statusCode !== 200) {
          const err = new Error(`Download failed: ${res.statusCode}`);
          res.resume();
          return reject(err);
        }

        const contentType = res.headers["content-type"] || "image/jpeg";
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, contentType });
        });
      })
      .on("error", reject);
  });
}

async function downloadDriveFile(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const first = await downloadUrl(url);
  if (!first.contentType.includes("text/html")) {
    return first;
  }

  const html = first.buffer.toString("utf8");
  const hrefMatch = html.match(/href="(\/uc\?export=download[^"]+)"/);
  if (hrefMatch) {
    const path = hrefMatch[1].replace(/&amp;/g, "&");
    return downloadUrl(`https://drive.google.com${path}`);
  }

  const confirmMatch = html.match(/confirm=([0-9A-Za-z_]+)/);
  if (confirmMatch) {
    const confirm = confirmMatch[1];
    return downloadUrl(
      `https://drive.google.com/uc?export=download&confirm=${confirm}&id=${fileId}`,
    );
  }

  throw new Error("Drive download requires confirmation");
}

async function main() {
  await mongoose.connect(MONGO_URI);

  let user = await User.findOne({ username: USERNAME });
  if (!user) {
    const stamp = Date.now().toString().slice(-6);
    user = await User.create({
      email: `${USERNAME}_${stamp}@example.com`,
      username: USERNAME,
      password: "ChangeMe123!",
      name: "IT Career Hub",
    });
  }

  const posts = [];

  for (const fileId of FILE_IDS) {
    const { buffer, contentType } = await downloadDriveFile(fileId);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;
    posts.push({
      authorId: user._id,
      image: dataUrl,
      caption: CAPTION,
    });
  }

  const created = await Post.insertMany(posts);
  console.log("User:", String(user._id), user.username);
  console.log(`Inserted posts: ${created.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
