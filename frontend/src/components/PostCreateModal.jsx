import React from "react";

import ModalShell from "./ModalShell.jsx";
import PostCreateContent from "./PostCreateContent.jsx";

export default function PostCreateModal({ onClose, onCreated, onUpdated, post }) {
  return (
    <ModalShell open onClose={onClose} preset="create">
      <PostCreateContent onClose={onClose} onCreated={onCreated} onUpdated={onUpdated} post={post} />
    </ModalShell>
  );
}
