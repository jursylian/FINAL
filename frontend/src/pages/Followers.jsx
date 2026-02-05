import React from "react";

import UserList from "../components/UserList.jsx";

export default function Followers() {
  return (
    <UserList
      endpoint="followers"
      title="Followers"
      emptyText="No followers yet."
    />
  );
}
