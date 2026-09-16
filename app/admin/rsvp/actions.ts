"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/app/admin/actions";

export async function deleteRsvp(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("rsvp_responses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/rsvp");
}
