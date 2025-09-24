import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'
import { requireAuth } from '@/app/lib/auth-middleware'

// GET /api/notes - View all notes (Members can only see their own, Admins see all in tenant)
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const user = authResult.user!
    let query = supabase
      .from('notes')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        users (
          id,
          name,
          email
        )
      `)
      .eq('tenant_id', user.tenantId)

    // Members can only see their own notes, Admins see all notes in their tenant
    if (user.role === 'member') {
      query = query.eq('user_id', user.id)
    }

    const { data: notes, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch notes'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: notes,
      count: notes.length
    })

  } catch (error) {
    console.error('Notes fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch notes'
    }, { status: 500 })
  }
}

// POST /api/notes - Create new note (Both Admin and Member can create)
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const user = authResult.user!
    const { title, content } = await request.json()

    if (!title) {
      return NextResponse.json({
        success: false,
        message: 'Title is required'
      }, { status: 400 })
    }
    
    // Check tenant's subscription plan and note count
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('subscription_plan')
      .eq('id', user.tenantId)
      .single()
      
    if (tenantError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to verify tenant information'
      }, { status: 500 })
    }
    
    // If tenant is on free plan, check if they've reached the 3 notes limit
    if (tenant.subscription_plan === 'free') {
      const { count, error: countError } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.tenantId)
        
      if (countError) {
        return NextResponse.json({
          success: false,
          message: 'Failed to verify note count'
        }, { status: 500 })
      }
      
      if (count !== null && count >= 3) {
        return NextResponse.json({
          success: false,
          message: 'Free plan is limited to 3 notes. Please upgrade to Pro for unlimited notes.',
          limitReached: true
        }, { status: 403 })
      }
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        user_id: user.id,
        tenant_id: user.tenantId
      })
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        users (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create note'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Note created successfully',
      data: note
    })

  } catch (error) {
    console.error('Note creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create note'
    }, { status: 500 })
  }
}