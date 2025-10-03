import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { generateToken } from "@/app/lib/jwt";
import { LoginRequest, LoginResponse } from "@/app/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { tenantId, email, password }: LoginRequest = await request.json();

    // Step 1: Validate input
    if (!tenantId || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Tenant, email, and password are required",
        } as LoginResponse,
        { status: 400 }
      );
    }

    // Step 2: Check if tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid company selected",
        } as LoginResponse,
        { status: 400 }
      );
    }

    // Step 3: Find user with email AND tenant_id (CRITICAL for isolation)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, role, tenant_id, password_hash")
      .eq("email", email)
      .eq("tenant_id", tenantId) // 🔒 CRITICAL: Must match tenant
      .single();
    const { data: subscription_plan, error: subscription_plan_error } =
      await supabase
        .from("tenants")
        .select("subscription_plan")
        .eq("id", tenantId)
        .single();
    // console.log("SUBSCRIPTION PLAN : ", subscription_plan);
    if (subscription_plan_error) {
      // console.log("SUBSCRIPTION PLAN ERROR : ", subscription_plan_error);
      return NextResponse.json(
        {
          success: false,
          message: "Something went wrong",
        } as LoginResponse,
        { status: 400 }
      );
    }
    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        } as LoginResponse,
        { status: 401 }
      );
    }

    // Step 4: Verify password (simplified - in production use bcrypt)
    if (user.password_hash !== password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        } as LoginResponse,
        { status: 401 }
      );
    }

    // Step 5: Generate JWT token
    const userForToken = {
      ...user,
      tenantName: tenant.name,
    };
    const token = generateToken(userForToken);

    // Step 6: Return success with JWT token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
        tenantName: tenant.name,
        subscription_plan: subscription_plan.subscription_plan,
      },
      token: token,
    } as LoginResponse);

    // Set JWT as HTTP-only cookie (more secure)
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      } as LoginResponse,
      { status: 500 }
    );
  }
}
