import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json({ id: 1, event_id: 1, threshold_pct: 10, direction: "drop" }, { status: 201 });
}
