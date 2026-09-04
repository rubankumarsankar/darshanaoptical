import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email = null,
      interest = "General Inquiry",
      message = null,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone number are required." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO inquiries (name, phone, email, interest, message, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [name, phone, email, interest, message]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry saved successfully.",
        id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json(
      { error: "Failed to save inquiry. Please try again or message via WhatsApp." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rows = await query("SELECT COUNT(*) as total FROM inquiries");
    return NextResponse.json({ success: true, count: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
