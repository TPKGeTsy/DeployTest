import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormInputProps = {
  name: string
  type: string
  label: string
  defaultValue?: string
  placeHolder?: string
}

const FormInput = (props: FormInputProps) => {
  const { name, type, label, defaultValue, placeHolder } = props
  
  return (
    <div className="mb-4">
      <Label htmlFor={name}>{label}</Label>
      <Input 
        name={name} 
        type={type} 
        placeholder={placeHolder} 
        defaultValue={defaultValue} 
        required 
      />
    </div>
  )
}

export default FormInput
