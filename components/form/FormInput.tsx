import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const FormInput = () => {
  return (
    <>
    <div className="mb-4">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" type="text" placeholder="พิมพ์ชื่อตรงนี้" required />
          </div>
    </>
  )
}
export default FormInput