import { Button } from "@/components/ui/button"
import Link from "next/link"

const Logo = () => {
  return (
    <Button size={'sm'}>
      <Link href={'/'} className="text-2xl">
        Logo
      </Link>
    </Button>
  )
}
export default Logo