import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { requireAdmin } from "@/app/lib/auth-middleware";

// POST /api/tenants/[slug]/upgrade - Upgrade tenant from free to pro plan (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    const { slug } = await params;

    // Verify the admin is trying to upgrade their own tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, subdomain, subscription_plan")
      .eq("id", user.tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        {
          success: false,
          message: "Tenant not found",
        },
        { status: 404 }
      );
    }

    // Verify the slug matches the tenant subdomain for extra security
    // console.log(tenant.subdomain.toString(), slug.toString());
    if (tenant.subdomain.toString() !== slug.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied: Tenant mismatch",
        },
        { status: 403 }
      );
    }

    // Check if already on Pro plan
    if (tenant.subscription_plan === "pro") {
      return NextResponse.json(
        {
          success: false,
          message: "Tenant is already on the Pro plan",
        },
        { status: 400 }
      );
    }

    // In a real application, this is where you would integrate with a payment processor
    // For this example, we'll just upgrade the plan directly

    // Update tenant to Pro plan
    const { data: updatedTenant, error: updateError } = await supabase
      .from("tenants")
      .update({
        subscription_plan: "pro",
      })
      .eq("id", user.tenantId)
      .select("id, name, subdomain, subscription_plan")
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upgrade tenant",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully upgraded to Pro plan",
      data: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        subdomain: updatedTenant.subdomain,
        subscription_plan: updatedTenant.subscription_plan,
      },
    });
  } catch (error) {
    console.error("Tenant upgrade error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upgrade tenant",
      },
      { status: 500 }
    );
  }
}
