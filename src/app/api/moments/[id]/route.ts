import { NextResponse } from "next/server";

import { deleteMoment, saveMoment } from "@/lib/moment-mutations";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const removePhotoIds = formData
      .getAll("removePhotoIds")
      .map((value) => String(value))
      .filter(Boolean);
    const result = await saveMoment({
      id,
      entryDate: String(formData.get("entryDate") ?? ""),
      text: String(formData.get("text") ?? ""),
      mood: String(formData.get("mood") ?? "") || null,
      files: formData.getAll("photos").filter((value): value is File => value instanceof File),
      removePhotoIds,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "The update did not land.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    await deleteMoment(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "The moment could not be deleted.",
      },
      { status: 400 },
    );
  }
}
