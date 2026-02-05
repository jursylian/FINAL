import Notification from "../models/Notification.js";
import { handleError } from "../utils/errorHandler.js";

export async function listNotifications(req, res) {
  try {
    const userId = req.userId;
    const unread =
      typeof req.query.unread === "string"
        ? req.query.unread === "true"
        : undefined;

    const query = { userId };
    if (typeof unread === "boolean") {
      query.read = !unread ? { $in: [true, false] } : false;
    }

    const items = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("actorId", "username avatar name");

    return res.status(200).json({ items });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function markNotificationRead(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId,
    }).populate("actorId", "username avatar name");

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ notification });
  } catch (err) {
    return handleError(err, res);
  }
}
