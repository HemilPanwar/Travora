import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const trips = await prisma.trip.findMany({
      where: { userId, status: "FINALIZED" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("[trips GET]", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("id");
    if (!tripId) {
      return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
    }
    const userId = (session.user as { id?: string }).id;
    await prisma.trip.deleteMany({ where: { id: tripId, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[trips DELETE]", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
