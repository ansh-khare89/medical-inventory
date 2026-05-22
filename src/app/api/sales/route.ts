import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface SaleItemInput {
  medicineId: string;
  quantity: number | string;
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
      include: { items: true },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body.items as SaleItemInput[];
    
    const sale = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const saleItemsToCreate = [];

      for (const item of items) {
        let remainingQuantity = Number(item.quantity);
        
        // Find all batches for this medicine that have quantity > 0, ordered by expiry date (FEFO)
        const batches = await tx.medicineBatch.findMany({
          where: {
            medicineId: item.medicineId,
            quantity: { gt: 0 }
          },
          orderBy: { expiryDate: 'asc' }
        });

        const totalAvailable = batches.reduce((sum, batch) => sum + batch.quantity, 0);
        if (totalAvailable < remainingQuantity) {
          throw new Error(`Insufficient stock for medicine ID ${item.medicineId}`);
        }

        for (const batch of batches) {
          if (remainingQuantity <= 0) break;

          const quantityToDeduct = Math.min(batch.quantity, remainingQuantity);
          
          await tx.medicineBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: quantityToDeduct } }
          });

          saleItemsToCreate.push({
            batchId: batch.id,
            quantity: quantityToDeduct,
            sellingPrice: batch.sellingPrice,
          });
          
          totalAmount += quantityToDeduct * batch.sellingPrice;
          remainingQuantity -= quantityToDeduct;
        }
      }

      const newSale = await tx.sale.create({
        data: {
          customerName: body.customerName || null,
          customerPhone: body.customerPhone || null,
          totalAmount,
          items: {
            create: saleItemsToCreate.map(item => ({
              batchId: item.batchId,
              quantity: item.quantity,
              sellingPrice: item.sellingPrice,
            }))
          }
        },
        include: { items: true }
      });

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    const message = error instanceof Error ? error.message : "Failed to create sale";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
