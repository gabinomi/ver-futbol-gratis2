'use client'
import React, { useState, useEffect } from 'react'
import { Partido, Estado } from '@/types'
import { Pencil, Trash2, GripVertical, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toaster'
import { useRouter } from 'next/navigation'
import { motion, Reorder, AnimatePresence } from 'framer-motion'

const estadoColor = {
  'EN-VIVO': 'bg-red-600/20 text-red-400 border-red-600/40',
  'PROXIMO': 'bg-blue-600/20 text-blue-400 border-blue-600/40',
  'FINALIZADO': 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40',
}

interface Props {
  initialPartidos: Partido[]
}

export default function PartidosTable({ initialPartidos }: Props) {
  const [partidos, setPartidos] = useState(initialPartidos)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setPartidos(initialPartidos)
  }, [initialPartidos])

  async function updatePartido(id: string, updates: Partial<Partido>) {
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/partidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        toast('Actualizado', 'success')
        router.refresh()
      } else {
        toast('Error al actualizar', 'error')
      }
    } catch {
      toast('Error de red', 'error')
    } finally {
      setSaving(null)
    }
  }

  async function deletePartido(id: string) {
    if (!confirm('¿Seguro que querés eliminar este partido?')) return
    try {
      const res = await fetch(`/api/admin/partidos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPartidos((prev) => prev.filter((p) => p.id !== id))
        toast('Partido eliminado', 'success')
      } else {
        toast('Error al eliminar', 'error')
      }
    } catch {
      toast('Error de red', 'error')
    }
  }

  async function handleReorder(newOrder: Partido[]) {
    setPartidos(newOrder)
    try {
      const res = await fetch('/api/admin/partidos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newOrder.map((p) => p.id) }),
      })
      if (!res.ok) toast('Error al guardar el nuevo orden', 'error')
    } catch {
      toast('Error al sincronizar orden', 'error')
    }
  }

  const filteredPartidos = partidos.filter(p => 
    p.equipo_local.toLowerCase().includes(search.toLowerCase()) || 
    p.equipo_visitante.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='flex flex-col gap-6'>
      <div className='relative max-w-md'>
        <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500'>
          <Globe size={16} />
        </div>
        <input
          type='text'
          placeholder='Buscar por equipo...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full bg-[#08102480] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-md'
        />
      </div>

      <div className='bg-[#08102480] border border-white/7 rounded-2xl overflow-hidden'>
        <div className='w-full overflow-x-auto'>
          <table className='w-full text-sm border-collapse'>
            <thead>
              <tr className='border-b border-white/7 text-slate-500 text-[10px] uppercase tracking-[2px] font-black'>
                <th className='px-4 py-4 w-10'></th>
                <th className='text-left px-4 py-4 font-semibold'>Partido</th>
                <th className='text-left px-4 py-4 font-semibold'>Estado</th>
                <th className='text-left px-4 py-4 font-semibold'>Marcador</th>
                <th className='text-left px-4 py-4 font-semibold'>Hora UTC</th>
                <th className='text-right px-4 py-4 font-semibold'>Acciones</th>
              </tr>
            </thead>
            <Reorder.Group as='tbody' axis='y' values={partidos} onReorder={handleReorder}>
              {filteredPartidos.map((p, i) => (
              <Reorder.Item
                as='tr'
                key={p.id}
                value={p}
                className={`border-b border-white/5 hover:bg-white/3 transition-colors group ${
                  i % 2 === 0 ? '' : 'bg-white/1'
                }`}
              >
                <td className='px-4 py-3 cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-slate-400'>
                  <GripVertical size={16} />
                </td>
                <td className='px-4 py-3'>
                  <div className='flex flex-col'>
                    <span className='font-barlow font-black uppercase tracking-wide text-white text-base italic'>
                      {p.equipo_local} <span className='text-slate-500 non-italic font-medium text-xs'>vs</span> {p.equipo_visitante}
                    </span>
                    <span className='text-[10px] text-slate-500 font-bold uppercase tracking-widest'>
                      {p.fixture_id ? `ID: ${p.fixture_id}` : 'Manual'}
                    </span>
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <select
                    value={p.estado}
                    onChange={(e) => updatePartido(p.id, { estado: e.target.value as Estado })}
                    className={`text-[10px] font-black tracking-[1.5px] uppercase px-3 py-1.5 rounded-full border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${estadoColor[p.estado]}`}
                  >
                    <option value='PROXIMO' className='bg-[#081024]'>PROXIMO</option>
                    <option value='EN-VIVO' className='bg-[#081024]'>EN-VIVO</option>
                    <option value='FINALIZADO' className='bg-[#081024]'>FINALIZADO</option>
                  </select>
                </td>
                <td className='px-4 py-3 font-barlow font-black text-white'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      value={p.gol_local}
                      onChange={(e) => updatePartido(p.id, { gol_local: +e.target.value })}
                      className='w-12 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-center focus:border-blue-500 outline-none transition-all'
                    />
                    <span className='text-slate-500'>-</span>
                    <input
                      type='number'
                      value={p.gol_visitante}
                      onChange={(e) => updatePartido(p.id, { gol_visitante: +e.target.value })}
                      className='w-12 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-center focus:border-blue-500 outline-none transition-all'
                    />
                    {saving === p.id && <Loader2 size={12} className='animate-spin text-blue-500 ml-1' />}
                  </div>
                </td>
                <td className='px-4 py-3 text-slate-400 text-xs font-medium'>
                  {p.hora_utc ? (
                    <div className='flex flex-col'>
                      <span className='text-white'>{new Date(p.hora_utc).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className='text-[10px] text-slate-500 uppercase'>{new Date(p.hora_utc).toLocaleDateString('es-AR')}</span>
                    </div>
                  ) : '—'}
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center justify-end gap-2'>
                    <Link href={`/admin/partidos/${p.id}`}
                      className='p-2 text-slate-400 hover:text-white hover:bg-white/7 rounded-xl transition-all border border-transparent hover:border-white/10'>
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => deletePartido(p.id)}
                      className='p-2 text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-xl transition-all border border-transparent hover:border-red-600/20'>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </table>
      </div>
      {partidos.length === 0 && (
        <div className='px-4 py-20 text-center'>
          <p className='text-slate-600 font-barlow italic uppercase tracking-[4px] text-xl opacity-50 font-black'>No hay partidos</p>
        </div>
      )}
    </div>
  )
}
