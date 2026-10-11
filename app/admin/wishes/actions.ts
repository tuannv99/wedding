"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/app/admin/actions";

function revalidateWishPaths() {
  revalidatePath("/admin/wishes");
  revalidatePath("/wishes");
  revalidatePath("/");
}

export async function deleteWish(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("wedding_wishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateWishPaths();
}
