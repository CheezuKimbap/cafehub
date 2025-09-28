import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password, role } = body
    
    if (!firstName || !lastName || !email || !password) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 400,
      })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    if(role === "ADMIN"){

      const admin =  await prisma.user.create({
        data:{
          name: `${firstName} ${lastName}`,
          email,
          role,
          password: hashedPassword
        }
      })
      return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: admin.id,
          email: admin.email
          
        },
      }),
      { status: 201 })
    }
    else{
    const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          role,
          customer: {
            create: {
              firstName,
              lastName,
              email,
              password: hashedPassword
            },
          },
        },
        include: { customer: true },
      })

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.customer?.firstName,
            lastName: user.customer?.lastName,
          },
        }),
        { status: 201 }
      )
      }
    // Create user + customer
  
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    )
  }
}
