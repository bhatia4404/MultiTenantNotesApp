import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'
import { requireAuth } from '@/app/lib/auth-middleware'

// GET /api/notes/[id] - View specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const user = authResult.user!
    const noteId = parseInt(params.id)

    if (isNaN(noteId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid note ID'
      }, { status: 400 })
    }

    let query = supabase
      .from('notes')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        user_id,
        users (
          id,
          name,
          email
        )
      `)
      .eq('id', noteId)
      .eq('tenant_id', user.tenantId)

    // Members can only view their own notes, Admins can view all notes in their tenant
    if (user.role === 'member') {
      query = query.eq('user_id', user.id)
    }

    const { data: note, error } = await query.single()

    if (error || !note) {
      return NextResponse.json({
        success: false,
        message: 'Note not found or access denied'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: note
    })

  } catch (error) {
    console.error('Note fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch note'
    }, { status: 500 })
  }
}

// PUT /api/notes/[id] - Update note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const user = authResult.user!
    const noteId = parseInt(params.id)
    const { title, content } = await request.json()

    if (isNaN(noteId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid note ID'
      }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({
        success: false,
        message: 'Title is required'
      }, { status: 400 })
    }

    // Check if note exists and user has permission
    let checkQuery = supabase
      .from('notes')
      .select('id, user_id')
      .eq('id', noteId)
      .eq('tenant_id', user.tenantId)

    // Members can only edit their own notes, Admins can edit all notes in their tenant
    if (user.role === 'member') {
      checkQuery = checkQuery.eq('user_id', user.id)
    }

    const { data: existingNote, error: checkError } = await checkQuery.single()

    if (checkError || !existingNote) {
      return NextResponse.json({
        success: false,
        message: 'Note not found or access denied'
      }, { status: 404 })
    }

    // Update the note
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update({
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
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

    if (updateError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update note'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    })

  } catch (error) {
    console.error('Note update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update note'
    }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const user = authResult.user!
    const noteId = parseInt(params.id)

    if (isNaN(noteId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid note ID'
      }, { status: 400 })
    }

    // Check if note exists and user has permission
    let checkQuery = supabase
      .from('notes')
      .select('id, user_id')
      .eq('id', noteId)
      .eq('tenant_id', user.tenantId)

    // Members can only delete their own notes, Admins can delete all notes in their tenant
    if (user.role === 'member') {
      checkQuery = checkQuery.eq('user_id', user.id)
    }

    const { data: existingNote, error: checkError } = await checkQuery.single()

    if (checkError || !existingNote) {
      return NextResponse.json({
        success: false,
        message: 'Note not found or access denied'
      }, { status: 404 })
    }

    // Delete the note
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (deleteError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete note'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    })

  } catch (error) {
    console.error('Note deletion error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete note'
    }, { status: 500 })
  }
}