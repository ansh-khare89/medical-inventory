import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface PurchaseItemInput {
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number | string;
  purchasePrice: number | string;
  sellingPrice: number | string;
}

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { purchaseDate: 'desc' },
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body.items as PurchaseItemInput[];
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.purchasePrice),
      0
    );

    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          supplierId: body.supplierId,
          invoiceNumber: body.invoiceNumber || null,
          totalAmount,
        }
      });

      for (const item of items) {
        // Upsert MedicineBatch
        const batch = await tx.medicineBatch.upsert({
          where: {
            medicineId_batchNumber: {
              medicineId: item.medicineId,
              batchNumber: item.batchNumber,
            }
          },
          update: {
            quantity: { increment: Number(item.quantity) },
            purchasePrice: Number(item.purchasePrice),
            sellingPrice: Number(item.sellingPrice),
            expiryDate: new Date(item.expiryDate),
          },
          create: {
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
            expiryDate: new Date(item.expiryDate),
            quantity: Number(item.quantity),
            purchasePrice: Number(item.purchasePrice),
            sellingPrice: Number(item.sellingPrice),
          }
        });

        // Create PurchaseItem
        await tx.purchaseItem.create({
          data: {
            purchaseId: newPurchase.id,
            batchId: batch.id,
            quantity: Number(item.quantity),
            purchasePrice: Number(item.purchasePrice),
          }
        });
      }

      return newPurchase;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
