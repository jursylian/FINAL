import React from "react";

import UserList from "../components/UserList.jsx";

export default function Following() {
  return (
    <UserList
      endpoint="following"
      title="Following"
      emptyText="Not following anyone yet."
    />
  );
}
