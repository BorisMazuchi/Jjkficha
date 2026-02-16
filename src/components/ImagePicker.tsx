import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImagePlus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePickerProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  className?: string
  /** Tamanho da prévia em pixels */
  previewSize?: number
}

export function ImagePicker({
  value,
  onChange,
  label = "Imagem",
  placeholder = "URL da imagem ou GIF",
  className,
  previewSize = 80,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (dataUrl) onChange(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-xs font-medium text-slate-400">{label}</label>
      )}
      <div className="flex flex-wrap items-start gap-2">
        {(value && (
          <div className="relative group">
            <img
              src={value}
              alt=""
              className={cn("rounded border border-slate-600 object-cover bg-slate-800")}
              style={{ width: previewSize, height: previewSize }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23475569'%3E%3Crect width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10'%3E?%3C/text%3E%3C/svg%3E"
              }}
            />
            <button
                type="button"
                onClick={() => onChange("")}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remover imagem"
              >
                <X className="h-3 w-3" />
              </button>
          </div>
        )) || null}
        <div className="flex flex-1 min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center">
          <Input
            placeholder={placeholder}
            value={value && value.startsWith("http") ? value : ""}
            onChange={(e) => {
              const v = e.target.value.trim()
              if (v) onChange(v)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                onChange((e.target as HTMLInputElement).value.trim())
              }
            }}
            className="h-8 border-slate-600 bg-slate-800/80 text-sm"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/10"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-1 h-3.5 w-3.5" />
            Enviar arquivo
          </Button>
        </div>
      </div>
    </div>
  )
}
