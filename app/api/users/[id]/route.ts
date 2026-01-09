import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır").optional(),
  studentName: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "COACH", "MEMBER"]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if user is authenticated
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database by ID
    let user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        studentName: true,
        role: true,
        createdAt: true,
      },
    })

    // If user not found by ID but exists in Supabase Auth, try to find by email
    // Only auto-create/update if this is the authenticated user requesting their own data
    if (!user && id === authUser.id && authUser.email) {
      // Check if user exists with same email but different ID
      const userByEmail = await prisma.user.findUnique({
        where: { email: authUser.email },
        select: {
          id: true,
          email: true,
          name: true,
          studentName: true,
          role: true,
          createdAt: true,
        },
      })

      if (userByEmail) {
        // User exists with different ID - update ID to match Supabase Auth (only if IDs are different)
        if (userByEmail.id !== authUser.id) {
          try {
            user = await prisma.user.update({
              where: { email: authUser.email },
              data: {
                id: authUser.id, // Update ID to match Supabase Auth
              },
              select: {
                id: true,
                email: true,
                name: true,
                studentName: true,
                role: true,
                createdAt: true,
              },
            })
          } catch (updateError: any) {
            // If update fails (e.g., ID already exists), just return the existing user
            console.warn("Failed to update user ID, returning existing user:", updateError.message)
            user = userByEmail
          }
        } else {
          user = userByEmail
        }
      } else {
        // User doesn't exist at all - create new user (only for authenticated user's own data)
        try {
          user = await prisma.user.create({
            data: {
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || null,
              role: "MEMBER", // Default role, admin can change later
            },
            select: {
              id: true,
              email: true,
              name: true,
              studentName: true,
              role: true,
              createdAt: true,
            },
          })
        } catch (createError: any) {
          // If unique constraint error, user might have been created between checks
          if (createError.code === 'P2002') {
            // Try to fetch again by ID or email
            user = await prisma.user.findUnique({
              where: { id },
              select: {
                id: true,
                email: true,
                name: true,
                studentName: true,
                role: true,
                createdAt: true,
              },
            }) || await prisma.user.findUnique({
              where: { email: authUser.email },
              select: {
                id: true,
                email: true,
                name: true,
                studentName: true,
                role: true,
                createdAt: true,
              },
            })
          } else {
            // For other errors, just log and continue
            console.error("Error creating user:", createError)
            // Don't throw - return 404 instead
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Users can only see their own data, or admins can see anyone
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true },
    })

    if (user.id !== authUser.id && (!dbUser || dbUser.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Kullanıcı getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if user is admin
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.studentName !== undefined && {
          studentName: validatedData.studentName,
        }),
        ...(validatedData.role !== undefined && { role: validatedData.role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        studentName: true,
        role: true,
        createdAt: true,
      },
    })

    // Update Supabase Auth user_metadata if role changed
    if (validatedData.role !== undefined) {
      try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        
        console.log("Attempting to update Supabase Auth metadata...")
        console.log("Service role key exists:", !!serviceRoleKey)
        console.log("Supabase URL exists:", !!supabaseUrl)
        
        if (serviceRoleKey && supabaseUrl) {
          // Create Supabase Admin client with service role key
          const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          })

          // Try to get existing user metadata to preserve other fields
          let existingMetadata = {}
          let authUserId = id // Default to the provided ID
          
          // First try to get user by ID
          const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(id)
          
          if (getUserError && getUserError.code === 'user_not_found') {
            // User not found by ID, try to find by email
            console.warn(`User ${id} not found in Supabase Auth by ID, trying email: ${updatedUser.email}`)
            
            const { data: usersByEmail, error: listError } = await supabaseAdmin.auth.admin.listUsers()
            
            if (!listError && usersByEmail?.users) {
              const foundUser = usersByEmail.users.find(u => u.email === updatedUser.email)
              if (foundUser) {
                authUserId = foundUser.id
                existingMetadata = foundUser.user_metadata || {}
                console.log(`✅ Found user in Supabase Auth by email. Auth ID: ${authUserId}, DB ID: ${id}`)
                console.log("Note: There's an ID mismatch between Prisma and Supabase Auth")
              } else {
                console.warn(`⚠️ User ${updatedUser.email || 'unknown'} not found in Supabase Auth at all.`)
                console.warn("This user exists in Prisma database but not in Supabase Auth.")
                console.warn("The role has been updated in the database, but Supabase Auth metadata cannot be updated.")
                console.warn("To fix this, the user needs to log in at least once to create their Auth record.")
                // Skip metadata update but return success
                return NextResponse.json({ 
                  message: "Kullanıcı güncellendi (veritabanı)", 
                  user: updatedUser,
                  warning: "Kullanıcı Supabase Auth'da bulunamadı. Metadata güncellenemedi."
                })
              }
            }
          } else if (getUserError) {
            console.error("Error getting existing user:", getUserError)
            // Continue with empty metadata
          } else {
            existingMetadata = existingUser?.user?.user_metadata || {}
            console.log("Existing metadata found:", existingMetadata)
          }

          // Update user metadata with role using the correct Auth user ID
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            user_metadata: {
              ...existingMetadata,
              role: validatedData.role,
              name: updatedUser.name || existingMetadata.name,
            },
          })

          if (updateError) {
            console.error("Failed to update Supabase Auth metadata:", updateError)
            console.error("Error details:", JSON.stringify(updateError, null, 2))
            // Continue anyway - database is updated
          } else {
            console.log(`✅ Successfully updated user_metadata for user ${authUserId} with role ${validatedData.role}`)
            console.log("Updated user data:", updateData?.user?.user_metadata)
          }
        } else {
          const missing = []
          if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY")
          if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
          console.warn(`⚠️ Missing environment variables: ${missing.join(", ")}`)
        }
      } catch (metadataError) {
        console.error("Error updating Supabase Auth metadata:", metadataError)
        if (metadataError instanceof Error) {
          console.error("Error message:", metadataError.message)
          console.error("Error stack:", metadataError.stack)
        }
        // Continue anyway - database is updated
      }
    }

    return NextResponse.json({ message: "Kullanıcı güncellendi", user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Kullanıcı güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
