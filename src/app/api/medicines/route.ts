import { NextResponse } from "next/server";
import { createId, getDb, now } from "@/lib/db";

interface MedicineRow {
  id: string;
  name: string;
  company: string | null;
  category: string | null;
  description: string | null;
  minimumStockLevel: number;
  rackLocation: string | null;
  prescriptionRequired: number;
  createdAt: string;
  updatedAt: string;
}

interface BatchRow {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const medicines = (search
      ? db
          .prepare(
            `SELECT * FROM "Medicine"
             WHERE "name" LIKE ? OR "company" LIKE ?
             ORDER BY "name" ASC`
          )
          .all(`%${search}%`, `%${search}%`)
      : db.prepare(`SELECT * FROM "Medicine" ORDER BY "name" ASC`).all()) as unknown as MedicineRow[];

    const batches = db.prepare(`SELECT * FROM "MedicineBatch"`).all() as unknown as BatchRow[];
    const medicinesWithBatches = medicines.map((medicine) => ({
      ...medicine,
      prescriptionRequired: Boolean(medicine.prescriptionRequired),
      batches: batches.filter((batch) => batch.medicineId === medicine.id),
    }));

    return NextResponse.json(medicinesWithBatches);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      company,
      category,
      description,
      minimumStockLevel,
      rackLocation,
      prescriptionRequired,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Medicine name is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = createId();
    const timestamp = now();

    db.prepare(
      `INSERT INTO "Medicine"
       ("id", "name", "company", "category", "description", "minimumStockLevel", "rackLocation", "prescriptionRequired", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      name,
      company ?? null,
      category ?? null,
      description ?? null,
      Number(minimumStockLevel) || 10,
      rackLocation ?? null,
      Boolean(prescriptionRequired) ? 1 : 0,
      timestamp,
      timestamp
    );

    const medicine = db.prepare(`SELECT * FROM "Medicine" WHERE "id" = ?`).get(id);

    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error("Error creating medicine:", error);
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 }
    );
  }
}
