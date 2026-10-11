"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminClient } from "@/app/admin/actions";
import { WISHES_TAG } from "@/lib/wishes";

function revalidateWishPaths() {
  revalidateTag(WISHES_TAG);
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
