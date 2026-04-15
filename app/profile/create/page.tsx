
import { Button } from "@/components/ui/button"
import { FormInput } from "lucide-react"

// เพิ่ม formData เข้าไปเพื่อรับค่าจาก Input
const createProfileAction = async (formData: FormData) => {
  'use server'
  
  // ดึงค่าจาก name="firstName"
  const firstName = formData.get("firstName")
  
  console.log("--- Server Action ---")
  console.log("Status: yey!")
  console.log("Received Name:", firstName)
}

const create = () => {
  return (
    <section className="max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-8 capitalize">
        new user
      </h1>
      <div className="border p-8 rounded-md max-w-lg">
        <form action={createProfileAction}>
          <FormInput />
          <Button type="submit" size="lg" className="w-full">
            Create Profile
          </Button>
        </form>
      </div>
    </section>
  )
}

export default create