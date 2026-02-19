import { NextResponse } from "next/server";
import { mockStatsMeta } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockStatsMeta);
}
