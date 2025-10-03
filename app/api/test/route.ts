import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    // Log environment variables for debugging (don't include this in production)
    // console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    // Don't log the full key in production, just check if it exists
    // console.log('SUPABASE KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const { data: tenants, error } = await supabase.from("tenants").select("*");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Database connection successful!",
      tenants: tenants,
    });
  } catch (error: any) {
    console.error("Route error:", error);
    return NextResponse.json(
      {
        error: "Connection failed",
        message: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
