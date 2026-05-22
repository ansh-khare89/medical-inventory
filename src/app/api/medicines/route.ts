import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const medicines = await prisma.medicine.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      orderBy: { name: 'asc' },
      include: { batches: true },
    });

    return NextResponse.json(medicines);
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

    const medicine = await prisma.medicine.create({
      data: {
        name,
        company: company || null,
        category: category || null,
        description: description || null,
        minimumStockLevel: Number(minimumStockLevel) || 10,
        rackLocation: rackLocation || null,
        prescriptionRequired: Boolean(prescriptionRequired),
      },
    });

    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error("Error creating medicine:", error);
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 }
    );
  }
}
