"use client"

import { SignOutButton } from "@clerk/nextjs"
import { toast } from "sonner"
import { Button } from "../ui/button"


export function SignOutLinks() {
  return (
    <SignOutButton>
      <Button
        onClick={() =>
          toast("Logout successful!", {
              description: "Monday, January 3rd at 6:00pm",
          })
      }
      variant="outline"
      className="w-full justify-start"
      >
        Logout
      </Button>
    </SignOutButton>
  )
}