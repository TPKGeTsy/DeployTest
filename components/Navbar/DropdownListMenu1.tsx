"use client"

import { TextAlignStart } from 'lucide-react';
import { CircleUser } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { links } from '@/utils/link';
import Link from 'next/link';
import { SignOutLinks } from './SignOutLinks';
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs"

const DropdownListMenu1 = () => {
  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <TextAlignStart />
          <CircleUser />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Show when="signed-in">
          {links.map((item, index) => (
            <DropdownMenuItem key={index}>
              <Link href={item.href} className="w-full">
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignOutLinks />
          </DropdownMenuItem>
        </Show>

        <Show when="signed-out">
          <DropdownMenuItem>
            <SignInButton mode="modal">
              <button className="w-full text-left">Login</button>
            </SignInButton>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SignUpButton mode="modal">
              <button className="w-full text-left">Register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </Show>
        
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
};

export default DropdownListMenu1;
