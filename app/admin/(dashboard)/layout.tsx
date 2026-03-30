'use client'
import { redirect, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Plus, LogOut, Settings, Globe, ShieldCheck } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Note: Client-side auth check is symbolic here, the real one is in middleware/server components
  // But we keep the redirect logic if needed or wrap it in a Server Component if real security is needed there.
  
  const navItems = [
    { href: '/admin/partidos', icon: LayoutDashboard, label: 'Partidos', sub: 'Gestión de eventos' },
    { href: '/admin/partidos/new', icon: Plus, label: 'Nuevo Partido', sub: 'Crear entrada' },
  ]

  return (
    <div className='min-h-screen flex bg-[#020617] text-slate-300 font-barlow'>
      {/* Sidebar */}
      <aside className='w-72 bg-[#08102480] border-r border-white/5 flex flex-col backdrop-blur-xl sticky top-0 h-screen'>
        <div className='px-8 py-10'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40'>
              <ShieldCheck className='text-white' size={24} />
            </div>
            <div className='flex flex-col'>
              <span className='text-white font-black uppercase tracking-[3px] text-lg leading-tight italic'>Ver Fútbol</span>
              <span className='text-blue-500 font-bold uppercase tracking-[4px] text-[10px]'>Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className='flex-1 px-4 flex flex-col gap-2'>
          <p className='px-4 text-[10px] font-black uppercase tracking-[3px] text-slate-600 mb-2'>Navegación</p>
          {navItems.map((item) => {
            const Active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                  Active 
                    ? 'bg-blue-600/10 text-white border border-blue-600/20 shadow-lg shadow-blue-900/10' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon size={20} className={Active ? 'text-blue-500' : 'group-hover:text-blue-400 transition-colors'} />
                <div className='flex flex-col'>
                  <span className='text-sm font-bold uppercase tracking-wider'>{item.label}</span>
                  <span className={`text-[10px] font-medium transition-colors ${Active ? 'text-blue-400/60' : 'text-slate-600 group-hover:text-slate-500'}`}>
                    {item.sub}
                  </span>
                </div>
              </Link>
            )
          })}

          <div className='mt-8'>
            <p className='px-4 text-[10px] font-black uppercase tracking-[3px] text-slate-600 mb-2'>Sistema</p>
            <Link href='#' className='flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all group border border-transparent'>
              <Settings size={20} className='group-hover:text-blue-400 transition-colors' />
              <div className='flex flex-col'>
                <span className='text-sm font-bold uppercase tracking-wider'>Configuración</span>
                <span className='text-[10px] font-medium text-slate-600'>Ajustes generales</span>
              </div>
            </Link>
          </div>
        </nav>

        <div className='p-6 mt-auto border-t border-white/5'>
          <div className='bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-5 rounded-3xl border border-blue-600/20 mb-6'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
              <span className='text-[10px] font-black uppercase tracking-widest text-emerald-500'>Live Stats</span>
            </div>
            <p className='text-[10px] text-slate-400 leading-relaxed'>El sistema está sincronizando con API-Football cada 5 minutos.</p>
          </div>
          
          <form action='/api/admin/logout' method='POST'>
            <button className='w-full flex items-center justify-center gap-2 py-4 bg-red-600/5 hover:bg-red-600/10 text-red-500 rounded-2xl text-xs font-black uppercase tracking-[2px] transition-all border border-red-600/10 hover:border-red-600/30'>
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 relative overflow-auto'>
        {/* Background Gradients */}
        <div className='fixed inset-0 pointer-events-none overflow-hidden -z-10'>
          <div className='absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full' />
          <div className='absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full' />
        </div>
        
        {/* Top Header Placeholder / Social Links */}
        <div className='h-20 border-b border-white/5 flex items-center justify-end px-12 gap-6 backdrop-blur-md sticky top-0 z-10'>
          <a href='/' target='_blank' className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors'>
            <Globe size={14} /> Ver Sitio Público
          </a>
          <div className='w-px h-4 bg-white/10' />
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <p className='text-[10px] font-black text-white uppercase tracking-widest leading-none'>Admin Master</p>
              <p className='text-[8px] font-bold text-blue-500 uppercase tracking-[2px] mt-1'>Conectado</p>
            </div>
            <div className='w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs'>
              AD
            </div>
          </div>
        </div>

        <div className='p-12'>
          {children}
        </div>
      </main>
    </div>
  )
}
