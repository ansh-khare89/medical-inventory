import { NextResponse } from "next/server";
import { createId, getDb, now } from "@/lib/db";

interface PurchaseItemInput {
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number | string;
  purchasePrice: number | string;
  sellingPrice: number | string;
}

interface PurchaseRow {
  id: string;
  supplierId: string;
  invoiceNumber: string | null;
  purchaseDate: string;
  totalAmount: number;
}

interface SupplierRow {
  id: string;
  name: string;
}

interface PurchaseItemRow {
  id: string;
  purchaseId: string;
  batchId: string;
  quantity: number;
  purchasePrice: number;
}

export async function GET() {
  try {
    const db = getDb();
    const purchases = db
      .prepare(`SELECT * FROM "Purchase" ORDER BY "purchaseDate" DESC`)
      .all() as unknown as PurchaseRow[];
    const suppliers = db.prepare(`SELECT "id", "name" FROM "Supplier"`).all() as unknown as SupplierRow[];
    const items = db.prepare(`SELECT * FROM "PurchaseItem"`).all() as unknown as PurchaseItemRow[];

    return NextResponse.json(
      purchases.map((purchase) => ({
        ...purchase,
        supplier: suppliers.find((supplier) => supplier.id === purchase.supplierId) ?? null,
        items: items.filter((item) => item.purchaseId === purchase.id),
      }))
    );
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = getDb();

  try {
    const body = await request.json();
    const items = body.items as PurchaseItemInput[];
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.purchasePrice),
      0
    );
    const purchaseId = createId();
    const timestamp = now();

    db.exec("BEGIN");

    db.prepare(
      `INSERT INTO "Purchase"
       ("id", "supplierId", "invoiceNumber", "purchaseDate", "totalAmount", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      purchaseId,
      body.supplierId,
      body.invoiceNumber ?? null,
      timestamp,
      totalAmount,
      timestamp,
      timestamp
    );

    for (const item of items) {
      const existingBatch = db
        .prepare(
          `SELECT "id", "quantity" FROM "MedicineBatch"
           WHERE "medicineId" = ? AND "batchNumber" = ?`
        )
        .get(item.medicineId, item.batchNumber);

      const batchId = (existingBatch?.id as string | undefined) ?? createId();

      if (existingBatch) {
        db.prepare(
          `UPDATE "MedicineBatch"
           SET "quantity" = ?, "purchasePrice" = ?, "sellingPrice" = ?, "expiryDate" = ?, "updatedAt" = ?
           WHERE "id" = ?`
        ).run(
          Number(existingBatch.quantity) + Number(item.quantity),
          Number(item.purchasePrice),
          Number(item.sellingPrice),
          new Date(item.expiryDate).toISOString(),
          timestamp,
          batchId
        );
      } else {
        db.prepare(
          `INSERT INTO "MedicineBatch"
           ("id", "medicineId", "batchNumber", "expiryDate", "quantity", "purchasePrice", "sellingPrice", "createdAt", "updatedAt")
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          batchId,
          item.medicineId,
          item.batchNumber,
          new Date(item.expiryDate).toISOString(),
          Number(item.quantity),
          Number(item.purchasePrice),
          Number(item.sellingPrice),
          timestamp,
          timestamp
        );
      }

      db.prepare(
        `INSERT INTO "PurchaseItem"
         ("id", "purchaseId", "batchId", "quantity", "purchasePrice", "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(createId(), purchaseId, batchId, Number(item.quantity), Number(item.purchasePrice), timestamp, timestamp);
    }

    db.exec("COMMIT");
    const purchase = db.prepare(`SELECT * FROM "Purchase" WHERE "id" = ?`).get(purchaseId);
    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Error creating purchase:", error);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
