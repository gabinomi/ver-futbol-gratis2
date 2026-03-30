'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Partido, Estado } from '@/types'
import { Search, Save, Loader2, Calendar, Target, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/Toaster'

interface Props {
  partido?: Partial<Partido>
  modo: 'nuevo' | 'editar'
}

interface FixtureResult {
  fixture_id: number
  hora_utc: string
  local: string
  visitante: string
  escudo_local: string | null
  escudo_visitante: string | null
}

const estadoOpts: Estado[] = ['PROXIMO', 'EN-VIVO', 'FINALIZADO']

export default function PartidoForm({ partido, modo }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [fixturesFound, setFixturesFound] = useState<FixtureResult[]>([])
  const [form, setForm] = useState<Partial<Partido>>({
    equipo_local: '',
    equipo_visitante: '',
    gol_local: 0,
    gol_visitante: 0,
    estado: 'PROXIMO',
    hora_utc: '',
    canales: '',
    link_video: '',
    link1: '',
    link2: '',
    link3: '',
    img_video: '',
    img_og: '',
    escudo_local: '',
    escudo_visitante: '',
    ...partido,
  })

  function set(key: keyof Partido, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function buscarPartido() {
    if (!form.equipo_local || !form.equipo_visitante) {
      toast('Ingresá los nombres de los equipos primero', 'error')
      return
    }
    setBuscando(true)
    setFixturesFound([])
    try {
      const res = await fetch('/api/admin/buscar-fixture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ local: form.equipo_local, visitante: form.equipo_visitante }),
      })
      const data = await res.json() as FixtureResult[]
      
      if (data.length > 0) {
        setFixturesFound(data)
        if (data.length === 1) {
          seleccionarFixture(data[0])
          toast('✓ Partido encontrado y cargado', 'success')
        } else {
          toast(`Se encontraron ${data.length} posibles partidos. Seleccioná el correcto.`, 'success')
        }
      } else {
        toast('No se encontró el partido. Ingresá los datos manualmente.', 'error')
      }
    } catch {
      toast('Error al buscar en la API', 'error')
    } finally {
      setBuscando(false)
    }
  }

  function seleccionarFixture(f: FixtureResult) {
    setForm(prev => ({
      ...prev,
      equipo_local: f.local,
      equipo_visitante: f.visitante,
      hora_utc: f.hora_utc,
      escudo_local: f.escudo_local || prev.escudo_local,
      escudo_visitante: f.escudo_visitante || prev.escudo_visitante,
      fixture_id: f.fixture_id,
    }))
    setFixturesFound([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const url = modo === 'nuevo' ? '/api/admin/partidos' : `/api/admin/partidos/${partido?.id}`
    const method = modo === 'nuevo' ? 'POST' : 'PUT'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast(modo === 'nuevo' ? 'Partido creado con éxito' : 'Cambios guardados', 'success')
        router.push('/admin/partidos')
        router.refresh()
      } else {
        toast(data.error || 'Error al guardar', 'error')
        setLoading(false)
      }
    } catch {
      toast('Error de red al guardar', 'error')
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-all text-sm'
  const labelCls = 'text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-2'

  const PreviewImg = ({ url, label }: { url?: string | null, label: string }) => (
    <div className='flex items-center gap-3 mt-2 p-2 bg-white/5 rounded-xl border border-white/5'>
      {url ? (
        <img src={url} alt={label} className='w-10 h-10 object-contain rounded-md' onError={(e) => (e.currentTarget.style.display = 'none')} />
      ) : (
        <div className='w-10 h-10 bg-white/5 rounded-md flex items-center justify-center text-slate-700'>
          <ImageIcon size={16} />
        </div>
      )}
      <span className='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>{label}</span>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className='max-w-3xl pb-20'>
      <div className='flex items-center justify-between mb-8 sticky top-0 bg-[#060d1a]/80 backdrop-blur-md py-4 z-10 border-b border-white/5'>
        <h1 className='font-barlow text-3xl font-black uppercase tracking-widest text-white italic'>
          {modo === 'nuevo' ? 'Crear Partido' : 'Editar Partido'}
        </h1>
        <button type='submit' disabled={loading}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-barlow font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50'>
          {loading ? <Loader2 size={18} className='animate-spin' /> : <Save size={18} />}
          Guardar
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        
        {/* Columna Izquierda: Datos Principales */}
        <div className='flex flex-col gap-6'>
          <section className='bg-[#08102480] border border-white/7 rounded-3xl p-6'>
            <h2 className='text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-6 flex items-center gap-2'>
              <Target size={12} className='text-blue-500' /> Información General
            </h2>
            
            <div className='flex flex-col gap-5'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className={labelCls}>Equipo local</label>
                  <input className={inputCls} value={form.equipo_local} onChange={e => set('equipo_local', e.target.value)} placeholder='Ej: River Plate' required />
                  <PreviewImg url={form.escudo_local} label='Escudo' />
                </div>
                <div>
                  <label className={labelCls}>Equipo visitante</label>
                  <input className={inputCls} value={form.equipo_visitante} onChange={e => set('equipo_visitante', e.target.value)} placeholder='Ej: Boca Juniors' required />
                  <PreviewImg url={form.escudo_visitante} label='Escudo' />
                </div>
              </div>

              <div>
                <button type='button' onClick={buscarPartido} disabled={buscando}
                  className='flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl font-barlow font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 w-full justify-center border border-white/5 shadow-lg group'>
                  {buscando ? <Loader2 size={16} className='animate-spin' /> : <Search size={16} className='group-hover:scale-110 transition-transform' />}
                  Buscar Fixture en API-Football
                </button>

                <AnimatePresence>
                  {fixturesFound.length > 1 && (
                    <div className='mt-4 p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl overflow-hidden'>
                      <p className='text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3'>Seleccioná el partido correcto:</p>
                      <div className='flex flex-col gap-2'>
                        {fixturesFound.map((f) => (
                          <button
                            key={f.fixture_id}
                            type='button'
                            onClick={() => seleccionarFixture(f)}
                            className='flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-left group'
                          >
                            <div className='flex flex-col'>
                              <span className='text-[11px] font-bold text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors'>
                                {f.local} vs {f.visitante}
                              </span>
                              <span className='text-[10px] text-slate-500 font-medium'>
                                {new Date(f.hora_utc).toLocaleDateString('es-AR')} - {new Date(f.hora_utc).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className='flex items-center -space-x-2'>
                              <img src={f.escudo_local || ''} className='w-6 h-6 object-contain' />
                              <img src={f.escudo_visitante || ''} className='w-6 h-6 object-contain' />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select className={inputCls} value={form.estado} onChange={e => set('estado', e.target.value as Estado)}>
                    {estadoOpts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Goles L</label>
                  <input type='number' min={0} className={inputCls} value={form.gol_local} onChange={e => set('gol_local', +e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Goles V</label>
                  <input type='number' min={0} className={inputCls} value={form.gol_visitante} onChange={e => set('gol_visitante', +e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelCls}><Calendar size={12} /> Hora UTC</label>
                <input className={inputCls} value={form.hora_utc || ''} onChange={e => set('hora_utc', e.target.value)} placeholder='2026-03-20T20:00:00Z' />
                <p className='text-[10px] text-slate-600 mt-2 italic'>Formato: YYYY-MM-DDTHH:MM:SSZ</p>
              </div>
            </div>
          </section>

          <section className='bg-[#08102480] border border-white/7 rounded-3xl p-6'>
            <h2 className='text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-6 flex items-center gap-2'>
              <ImageIcon size={12} className='text-amber-500' /> Identidad Visual
            </h2>
            <div className='flex flex-col gap-4'>
              <div>
                <label className={labelCls}>Imagen Reproductor</label>
                <input className={inputCls} value={form.img_video || ''} onChange={e => set('img_video', e.target.value)} placeholder='https://i.imgur.com/...' />
                <PreviewImg url={form.img_video} label='Banner Video' />
              </div>
              <div>
                <label className={labelCls}>Imagen OG (Redes)</label>
                <input className={inputCls} value={form.img_og || ''} onChange={e => set('img_og', e.target.value)} placeholder='https://i.imgur.com/...' />
                <PreviewImg url={form.img_og} label='Miniatura' />
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Links y Canales */}
        <div className='flex flex-col gap-6'>
          <section className='bg-[#08102480] border border-white/7 rounded-3xl p-6'>
            <h2 className='text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-6 flex items-center gap-2'>
              <Target size={12} className='text-emerald-500' /> Transmisión
            </h2>
            <div className='flex flex-col gap-5'>
              <div>
                <label className={labelCls}>Canales Televisivos</label>
                <input className={inputCls} value={form.canales || ''} onChange={e => set('canales', e.target.value)} placeholder='ESPN · Star+ · DSports' />
              </div>
              <div>
                <label className={labelCls}><span className='w-2 h-2 rounded-full bg-blue-500' /> Botón Principal (Redir)</label>
                <input className={inputCls} value={form.link_video || ''} onChange={e => set('link_video', e.target.value)} placeholder='https://...' />
              </div>
              <div className='grid grid-cols-1 gap-4'>
                <div className='grid grid-cols-3 gap-3'>
                  {(['link1','link2','link3'] as const).map((k, i) => (
                    <div key={k}>
                      <label className={labelCls}>Opción {i+1}</label>
                      <input className={inputCls} value={(form[k] as string) || ''} onChange={e => set(k, e.target.value)} placeholder='Link directo' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className='bg-blue-600/5 border border-blue-600/10 rounded-3xl p-6 h-full flex flex-col justify-center items-center text-center'>
            <div className='w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4'>
              <Target size={32} className='text-blue-500' />
            </div>
            <h3 className='font-barlow text-lg font-black uppercase tracking-widest text-white mb-2 italic'>Verificación de Datos</h3>
            <p className='text-slate-500 text-xs leading-relaxed max-w-[200px]'>
              Asegurate de que los escudos carguen correctamente. Si no aparecen, buscá el URL en Google Imágenes.
            </p>
          </section>
        </div>

      </div>
    </form>
  )
}
