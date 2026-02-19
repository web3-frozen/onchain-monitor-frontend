import { NextResponse } from "next/server";
import { mockStats } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockStats);
}
