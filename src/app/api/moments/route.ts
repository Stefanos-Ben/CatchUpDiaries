import { NextResponse } from "next/server";

import { saveMoment } from "@/lib/moment-mutations";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await saveMoment({
      entryDate: String(formData.get("entryDate") ?? ""),
      text: String(formData.get("text") ?? ""),
      mood: String(formData.get("mood") ?? "") || null,
      files: formData.getAll("photos").filter((value): value is File => value instanceof File),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went soft-focus while saving.",
      },
      { status: 400 },
    );
  }
}
