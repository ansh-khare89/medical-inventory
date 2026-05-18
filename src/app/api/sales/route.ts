import { NextResponse } from "next/server";
import { createId, getDb, now } from "@/lib/db";

interface SaleItemInput {
  medicineId: string;
  quantity: number | string;
}

interface SaleRow {
  id: string;
  saleDate: string;
  customerName: string | null;
  customerPhone: string | null;
  totalAmount: number;
}

interface SaleItemRow {
  id: string;
  saleId: string;
  batchId: string;
  quantity: number;
  sellingPrice: number;
}

interface BatchRow {
  id: string;
  quantity: number;
  sellingPrice: number;
}

export async function GET() {
  try {
    const db = getDb();
    const sales = db.prepare(`SELECT * FROM "Sale" ORDER BY "saleDate" DESC`).all() as unknown as SaleRow[];
    const items = db.prepare(`SELECT * FROM "SaleItem"`).all() as unknown as SaleItemRow[];

    return NextResponse.json(
      sales.map((sale) => ({
        ...sale,
        items: items.filter((item) => item.saleId === sale.id),
      }))
    );
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = getDb();

  try {
    const body = await request.json();
    const items = body.items as SaleItemInput[];
    const saleId = createId();
    const timestamp = now();
    const saleItemsToCreate: Array<{ batchId: string; quantity: number; sellingPrice: number }> = [];
    let totalAmount = 0;

    db.exec("BEGIN");

    for (const item of items) {
      let remainingQuantity = Number(item.quantity);
      const batches = db
        .prepare(
          `SELECT "id", "quantity", "sellingPrice" FROM "MedicineBatch"
           WHERE "medicineId" = ? AND "quantity" > 0
           ORDER BY "expiryDate" ASC`
        )
        .all(item.medicineId) as unknown as BatchRow[];

      const totalAvailable = batches.reduce((sum, batch) => sum + batch.quantity, 0);
      if (totalAvailable < remainingQuantity) {
        throw new Error(`Insufficient stock for medicine ID ${item.medicineId}`);
      }

      for (const batch of batches) {
        if (remainingQuantity <= 0) {
          break;
        }

        const quantityToDeduct = Math.min(batch.quantity, remainingQuantity);
        db.prepare(`UPDATE "MedicineBatch" SET "quantity" = ?, "updatedAt" = ? WHERE "id" = ?`).run(
          batch.quantity - quantityToDeduct,
          timestamp,
          batch.id
        );

        saleItemsToCreate.push({
          batchId: batch.id,
          quantity: quantityToDeduct,
          sellingPrice: batch.sellingPrice,
        });
        totalAmount += quantityToDeduct * batch.sellingPrice;
        remainingQuantity -= quantityToDeduct;
      }
    }

    db.prepare(
      `INSERT INTO "Sale"
       ("id", "saleDate", "customerName", "customerPhone", "totalAmount", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      saleId,
      timestamp,
      body.customerName ?? null,
      body.customerPhone ?? null,
      totalAmount,
      timestamp,
      timestamp
    );

    for (const item of saleItemsToCreate) {
      db.prepare(
        `INSERT INTO "SaleItem"
         ("id", "saleId", "batchId", "quantity", "sellingPrice", "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(createId(), saleId, item.batchId, item.quantity, item.sellingPrice, timestamp, timestamp);
    }

    db.exec("COMMIT");
    const sale = db.prepare(`SELECT * FROM "Sale" WHERE "id" = ?`).get(saleId);
    return NextResponse.json({ ...sale, items: saleItemsToCreate }, { status: 201 });
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Error creating sale:", error);
    const message = error instanceof Error ? error.message : "Failed to create sale";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
