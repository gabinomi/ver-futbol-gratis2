import { supabaseAdmin } from '@/lib/supabase'
import { Partido } from '@/types'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import PartidosTable from '@/components/admin/PartidosTable'

export const revalidate = 0

export default async function AdminPartidosPage() {
  const { data } = await supabaseAdmin()
    .from('partidos')
    .select('*')
    .order('orden', { ascending: true })
    .order('creado_en', { ascending: false })

  const partidos = (data as Partido[]) || []

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex flex-col'>
          <h1 className='font-barlow text-3xl font-black uppercase tracking-widest text-white italic'>Partidos</h1>
          <p className='text-[10px] text-slate-500 font-bold uppercase tracking-[3px] mt-1'>Gestión en tiempo real</p>
        </div>
        <Link href='/admin/partidos/new'
          className='flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-barlow font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-900/20 active:scale-95'>
          <Plus size={18} /> Nuevo partido
        </Link>
      </div>

      <PartidosTable initialPartidos={partidos} />
    </div>
  )
}
