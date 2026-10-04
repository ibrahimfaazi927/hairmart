import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Salary system has been removed as per configuration.' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ message: 'Salary system has been removed as per configuration.' }, { status: 410 });
}
