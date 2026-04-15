"use client"

import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, ExternalLink, Edit } from "lucide-react"
import { toast } from "sonner"

export default function VocabActions({ vocabId }: { vocabId: string }) {
  
  const handleDelete = () => {
    toast.error("ฟังก์ชันลบกำลังอยู่ในระหว่างการพัฒนา", {
      description: `ไม่สามารถลบ ID: ${vocabId} ได้ในขณะนี้`,
      action: {
        label: "รับทราบ",
        onClick: () => console.log("User acknowledged delete failure"),
      },
    })
  }

  const handleDetail = () => {
    toast.info("กำลังเปิดหน้ารายละเอียด", {
      description: `Vocab ID: ${vocabId}`,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleDetail}>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>รายละเอียด</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast("ฟีเจอร์แก้ไขจะมาเร็วๆ นี้")}>
          <Edit className="mr-2 h-4 w-4" />
          <span>แก้ไข</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>ลบรายการ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}