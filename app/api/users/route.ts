import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { requireAdmin } from "@/app/lib/auth-middleware";

// GET /api/users - View all users in tenant (Admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.error,
        },
        { status: 403 }
      );
    }

    const user = authResult.user!;

    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        name,
        role,
        created_at,
        tenants (
          id,
          name,
          subdomain
        )
      `
      )
      .eq("tenant_id", user.tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch users",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Invite new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.error,
        },
        { status: 403 }
      );
    }

    const admin = authResult.user!;
    const { email, name, role } = await request.json();

    if (!email || !name || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, name, and role are required",
        },
        { status: 400 }
      );
    }

    if (!["admin", "member"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role must be admin or member",
        },
        { status: 400 }
      );
    }

    // Check if user already exists in this tenant
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("tenant_id", admin.tenantId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists in your organization",
        },
        { status: 409 }
      );
    }

    // Create new user with default password
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        role,
        password_hash: "password", // In production, generate random password and send via email
        tenant_id: admin.tenantId,
      })
      .select(
        `
        id,
        email,
        name,
        role,
        created_at,
        tenants (
          id,
          name,
          subdomain
        )
      `
      )
      .single();

    if (createError) {
      console.log("User creation error:", createError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User invited successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to invite user",
      },
      { status: 500 }
    );
  }
}
