import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { requireAdmin } from "@/app/lib/auth-middleware";

// POST /api/tenants/[slug]/downgrade - Downgrade tenant from pro to free plan (Admin only)
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

    // Verify the admin is trying to downgrade their own tenant
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
    if (tenant.subdomain !== slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied: Tenant mismatch",
        },
        { status: 403 }
      );
    }

    // Check if already on Free plan
    if (tenant.subscription_plan === "free") {
      return NextResponse.json(
        {
          success: false,
          message: "Tenant is already on the Free plan",
        },
        { status: 400 }
      );
    }

    // Update tenant to Free plan
    const { data: updatedTenant, error: updateError } = await supabase
      .from("tenants")
      .update({ subscription_plan: "free" })
      .eq("id", user.tenantId)
      .select("id, name, subdomain, subscription_plan")
      .single();

    if (updateError) {
      console.error("Error downgrading tenant:", updateError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to downgrade plan",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully downgraded to Free plan",
      data: updatedTenant,
    });
  } catch (error) {
    console.error("Tenant downgrade error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to downgrade plan",
      },
      { status: 500 }
    );
  }
}
