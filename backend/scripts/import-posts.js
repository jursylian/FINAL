import "dotenv/config";
import mongoose from "mongoose";
import https from "https";

import User from "../src/models/User.js";
import Post from "../src/models/Post.js";

const MONGO_URI = process.env.MONGO_URI;
const CAPTION = "From quiet roads to busy cities every moment matters";

const FILE_IDS = [
  "1A7d6_8rWwOLs-BAwox5p4yaeK1uAqG8H",
  "1FTpUlhfrT-HLtPJh1xOfNQpA5Yk3Dm1g",
  "1I1VIaffnIGWSt-CcUSCFl6Sn4MtGjD9c",
  "1gBhgvZzJVZhBI5_9LQwvj8lrJloS8vTK",
  "1jE2RZGGYxFo6_E6DSaBi0sBj-EGooJlZ",
  "1mudPGkiE5XJ3cIzZv-X9RPx6T7DhBg_Y",
  "1sNX0tFapFGBlFXf9yhfMLqAsgr8rNMnN",
  "1iLaN3qUTzenRu-KVi5zKrUUoEh58MiLT",
  "10rljxcKbM8DDAF19icG0Xwkw2alAvJ8z",
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

  const stamp = Date.now().toString().slice(-6);
  const username = `figma_user_${stamp}`;
  const email = `${username}@example.com`;
  const password = "ChangeMe123!";

  const user = await User.create({
    email,
    username,
    password,
    name: "Figma Import",
  });

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

  console.log("Created user:");
  console.log({ _id: String(user._id), email, username, password });
  console.log(`Inserted posts: ${created.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
