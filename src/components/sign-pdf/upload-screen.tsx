import { Lock, Plus, ShieldCheck, Zap } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

type Props = {
  onFile: (file: File) => void
  error?: string | null
}

export function UploadScreen({ onFile, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  return (
    <div className="flex flex-1 flex-col items-center px-4 pb-16 pt-12 md:pt-20 bg-slate-50 dark:bg-slate-950"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">Sign PDF</h1>
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          Your tool to eSign documents. Draw, type or upload your signature, place it anywhere on the page and
          download the signed PDF.
        </p>
      </div>

      <div
        className={cn(
          'mt-10 flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border-2 border-dashed px-6 py-12 transition-colors',
          dragging ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Button
          size="lg"
          className="h-14 rounded-xl px-10 text-lg font-semibold shadow-lg shadow-emerald-500/25"
          onClick={() => inputRef.current?.click()}
        >
          <Plus className="size-5" aria-hidden="true" />
          Select PDF file
        </Button>
        <p className="text-sm text-slate-500">or drop a PDF here</p>
        {error ? (
          <p role="alert" className="rounded-md bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}
      </div>

      <ul className="mt-12 grid w-full max-w-3xl gap-6 text-left sm:grid-cols-3">
        <Feature
          icon={<Lock className="size-5" aria-hidden="true" />}
          title="Private by design"
          body="Your PDF never leaves your browser. Everything is processed on your device."
        />
        <Feature
          icon={<Zap className="size-5" aria-hidden="true" />}
          title="Instant"
          body="No upload, no waiting. Place your signature and download in seconds."
        />
        <Feature
          icon={<ShieldCheck className="size-5" aria-hidden="true" />}
          title="Vector quality"
          body="Signatures and text are embedded at full resolution into the original PDF."
        />
      </ul>
    </div>
  )
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="flex flex-col gap-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">{icon}</span>
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>
    </li>
  )
}
