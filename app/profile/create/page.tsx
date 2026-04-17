import { SubmitButton } from "@/components/form/Button"
import FormInput from "@/components/form/FormInput"
import { Button } from "@/components/ui/button"


// เพิ่ม formData เข้าไปเพื่อรับค่าจาก Input
const createProfileAction = async (formData: FormData) => {
  'use server'

  // ดึงค่าจาก name="firstName"
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const userName = formData.get("userName")
  console.log("--- Server Action ---")
  console.log("Status: yey!")
  console.log("Received Name:", firstName)
  console.log("",lastName)
  console.log("",userName)
}


const create = () => {
  return (
    <section className="max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-8 capitalize">
        new user
      </h1>
      <div className="border p-8 rounded-md">
        <form action={createProfileAction}>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <FormInput name="firstName" label="First Name" type="text" placeHolder="First Name" />
            <FormInput name="lastName" label="Last Name" type="text" placeHolder="Last Name" />
            <FormInput name="userName" label="User Name" type="text" placeHolder="User Name" />
          <SubmitButton text="Create Profile" size="lg" className=""/>
          </div>
        </form>
      </div>
    </section>
  )
}

export default create