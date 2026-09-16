"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/app/admin/actions";

function revalidateWishPaths() {
  revalidatePath("/admin/wishes");
  revalidatePath("/wishes");
  revalidatePath("/");
}

export async function approveWish(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("wedding_wishes")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateWishPaths();
}

export async function unapproveWish(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("wedding_wishes")
    .update({ is_approved: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateWishPaths();
}

export async function deleteWish(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("wedding_wishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateWishPaths();
}
