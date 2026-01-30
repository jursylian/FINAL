import React from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";

import Feed from "./pages/Feed.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Reset from "./pages/Reset.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import NotFound from "./pages/NotFound.jsx";
import Profile from "./pages/Profile.jsx";
import ProfileEdit from "./pages/ProfileEdit.jsx";
import PostCreate from "./pages/PostCreate.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Followers from "./pages/Followers.jsx";
import Following from "./pages/Following.jsx";
import Explore from "./pages/Explore.jsx";
import Notifications from "./pages/Notifications.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts/new"
        element={
          <ProtectedRoute>
            <PostCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id/edit"
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id/followers"
        element={
          <ProtectedRoute>
            <Followers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id/following"
        element={
          <ProtectedRoute>
            <Following />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
