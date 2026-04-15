"use client" // สำคัญมาก! ต้องใส่บรรทัดแรก

import { Button } from "@/components/ui/button"

export default function VocabActions({ vocabId }: { vocabId: string }) {
  
  // ตัวอย่างฟังก์ชันโง่ๆ ก่อน เดี๋ยวเราค่อยทำแบบลบจริงใน DB
  const handleAlert = (id: string) => {
    alert(`นายกำลังจะจัดการกับคำศัพท์ ID: ${id} ใช่ไหม?`)
    console.log("จัดการ ID:", id)
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleAlert(vocabId)}
      >
        รายละเอียด
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => alert("ใจเย็น! พรุ่งนี้ค่อยมาทำระบบลบจริง")}
      >
        ลบ
      </Button>
    </div>
  )
}