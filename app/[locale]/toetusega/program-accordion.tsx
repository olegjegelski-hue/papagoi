'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

export type ProgramRow = {
  id: string
  name: string
  url: string
  ranits: boolean
  muraka: boolean
  theme: string | null
  estonianNote: string | null
}

export type ProgramGroup = {
  id: string
  title: string
  items: ProgramRow[]
}

type Props = {
  groups: ProgramGroup[]
  markRanits: string
  viewProgram: string
  murakaAlt: string
}

export default function ProgramAccordion({ groups, markRanits, viewProgram, murakaAlt }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = open[group.id] === true
        return (
          <div key={group.id} className="bg-card text-card-foreground border rounded-xl shadow-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
            >
              <span className="text-lg font-semibold text-gray-800">{group.title}</span>
              <ChevronDown
                className={`w-5 h-5 text-papagoi-green flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {isOpen && (
              <ul className="border-t border-papagoi-beige-200">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center border-b border-papagoi-beige-200 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.estonianNote && (
                        <p className="text-sm text-gray-500 mt-1">{item.estonianNote}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.ranits && (
                        <span className="text-sm font-medium text-gray-700">🎒 {markRanits}</span>
                      )}
                      {item.muraka && (
                        <Image
                          src="/toetusega/murakamargis.png"
                          alt={murakaAlt}
                          width={40}
                          height={40}
                          className="h-10 w-10"
                        />
                      )}
                      {item.theme && (
                        <span className="text-sm font-medium text-papagoi-green">{item.theme}</span>
                      )}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-papagoi-green hover:underline whitespace-nowrap"
                    >
                      {viewProgram} →
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
