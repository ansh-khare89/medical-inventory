import { NextResponse } from "next/server";
import { createId, getDb, now } from "@/lib/db";

interface SupplierRow {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  gstNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const suppliers = (search
      ? db
          .prepare(
            `SELECT * FROM "Supplier"
             WHERE "name" LIKE ? OR "phone" LIKE ?
             ORDER BY "name" ASC`
          )
          .all(`%${search}%`, `%${search}%`)
      : db.prepare(`SELECT * FROM "Supplier" ORDER BY "name" ASC`).all()) as unknown as SupplierRow[];

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, gstNumber } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = createId();
    const timestamp = now();

    db.prepare(
      `INSERT INTO "Supplier" ("id", "name", "phone", "address", "gstNumber", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name, phone ?? null, address ?? null, gstNumber ?? null, timestamp, timestamp);

    const supplier = db.prepare(`SELECT * FROM "Supplier" WHERE "id" = ?`).get(id);

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
