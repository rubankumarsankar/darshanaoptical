import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { sendAppointmentConfirmation } from "@/app/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email = null,
      preferred_date = null,
      preferred_time = null,
      test_type = "Eye Testing",
      wears_glasses = "No",
      notes = null,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone number are required." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO appointments (name, phone, email, preferred_date, preferred_time, test_type, wears_glasses, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        name,
        phone,
        email,
        preferred_date,
        preferred_time,
        test_type,
        wears_glasses,
        notes,
      ]
    );

    // Send dual email notifications (shop owner + customer confirmation if email provided)
    sendAppointmentConfirmation({
      name,
      phone,
      email: email || null,
      testType: test_type,
      preferredDate: preferred_date,
      preferredTime: preferred_time,
      wearsGlasses: wears_glasses,
      notes,
    }).catch((err) => console.error("[mailer] Appointment email failed:", err));

    return NextResponse.json(
      {
        success: true,
        message: "Appointment request saved successfully.",
        id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving appointment:", error);
    return NextResponse.json(
      { error: "Failed to save appointment. Please try again or message via WhatsApp." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await query("SELECT COUNT(*) as total FROM appointments");
    return NextResponse.json({ success: true, count: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
