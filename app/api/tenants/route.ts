import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET() {
  try {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, subdomain')
      .order('name')

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch companies'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: tenants
    })

  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch companies'
    }, { status: 500 })
  }
}