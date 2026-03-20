"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

export async function updateProfileImage(formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "No file selected" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, WebP, and AVIF images are allowed" };
  }

  if (file.size > MAX_SIZE) {
    return { success: false, error: "Image must be under 2 MB" };
  }

  // Ensure upload directory exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Generate unique filename
  const ext = file.name.split(".").pop() ?? "jpg";
  const safeName = `${crypto.randomUUID()}.${ext.replace(/[^a-zA-Z0-9]/g, "")}`;
  const filePath = path.join(UPLOAD_DIR, safeName);
  const publicUrl = `/uploads/avatars/${safeName}`;

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Delete old avatar file if it was a local upload
  const [current] = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (current?.image?.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), "public", current.image);
    await fs.unlink(oldPath).catch(() => {});
  }

  // Update DB
  await db
    .update(user)
    .set({ image: publicUrl, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeProfileImage() {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  // Delete old avatar file if it was a local upload
  const [current] = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (current?.image?.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), "public", current.image);
    await fs.unlink(oldPath).catch(() => {});
  }

  await db
    .update(user)
    .set({ image: null, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/", "layout");
  return { success: true };
}
