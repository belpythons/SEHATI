import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface Props {
  id: string
  children: React.ReactNode
  span?: 'col-span-1' | 'col-span-2' | 'col-span-3'
}

export const DraggableWidget: React.FC<Props> = ({ id, children, span = 'col-span-1' }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.75 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col ${span} transition-shadow duration-200 ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-500 rounded-2xl' : ''
      }`}
    >
      {/* Drag handle button on top right of widget */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        aria-label="Geser posisi widget"
        title="Tahan dan geser untuk mengatur tata letak widget"
        className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-slate-100/95 text-slate-500 sm:text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-grab active:cursor-grabbing backdrop-blur-xs shadow-xs"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {children}
    </div>
  )
}
