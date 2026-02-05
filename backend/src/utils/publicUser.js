export function toPublicUser(userDoc) {
  const obj = userDoc.toObject();
  delete obj.password;
  delete obj.resetPasswordTokenHash;
  delete obj.resetPasswordExpiresAt;
  return obj;
}
