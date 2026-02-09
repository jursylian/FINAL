import React from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";

import Feed from "./pages/Feed.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Reset from "./pages/Reset.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import NotFound from "./pages/NotFound.jsx";
import Profile from "./pages/Profile.jsx";
import ProfileEdit from "./pages/ProfileEdit.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import PostCreate from "./pages/PostCreate.jsx";
import Followers from "./pages/Followers.jsx";
import Following from "./pages/Following.jsx";
import Explore from "./pages/Explore.jsx";
import Notifications from "./pages/Notifications.jsx";
import Search from "./pages/Search.jsx";
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected with shared layout (sidebar) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Feed />} />
        <Route path="/create" element={<PostCreate />} />
        <Route path="/posts/new" element={<PostCreate />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/:id/edit" element={<ProfileEdit />} />
        <Route path="/profile/:id/followers" element={<Followers />} />
        <Route path="/profile/:id/following" element={<Following />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
