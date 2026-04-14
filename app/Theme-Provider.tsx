"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export default function Providers({ children }: { children: React.ReactNode }) {
  // 1. สร้าง State มาเช็กว่าโหลดหน้าเว็บเสร็จ (Mount) หรือยัง
  const [mounted, setMounted] = React.useState(false)

  // 2. useEffect จะทำงานเมื่อโหลดหน้าเว็บฝั่ง Client เสร็จเท่านั้น
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 3. ถ้ายังโหลดไม่เสร็จ ให้คืนค่า children เปล่าๆ ไปก่อน (เลี่ยง Hydration Error)
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}