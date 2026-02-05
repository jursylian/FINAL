export function handleError(err, res) {
  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message, details: err.errors });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Duplicate entry" });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
}
