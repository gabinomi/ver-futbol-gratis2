import { ZONAS } from '@/types'

export function calcularHorarios(horaUtc: string): [string, string][] {
  const fecha = new Date(horaUtc)
  return ZONAS.map(z => {
    const hora = fecha.toLocaleTimeString('es', {
      timeZone: z.tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return [z.pais, hora]
  })
}

export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function buscarEscudo(equipo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(equipo)}`
    )
    const data = await res.json()
    return data?.teams?.[0]?.strBadge || null
  } catch {
    return null
  }
}

export async function buscarFixture(
  equipoLocal: string,
  equipoVisitante: string
): Promise<{ fixture_id: number; hora_utc: string; local: string; visitante: string; escudo_local: string | null; escudo_visitante: string | null }[]> {
  try {
    const headers = { 'x-apisports-key': process.env.API_FOOTBALL_KEY! }
    
    // Buscamos fixtures del equipo local (los próximos 10)
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${encodeURIComponent(equipoLocal)}&next=15`,
      { headers }
    )
    const data = await res.json()
    const fixtures = data?.response || []

    // Filtramos los que coincidan con el visitante de alguna forma
    const vLower = equipoVisitante.toLowerCase()
    
    // Intentamos encontrar coincidencias
    const coincidencias = fixtures.filter((f: any) => {
      const home = f.teams.home.name.toLowerCase()
      const away = f.teams.away.name.toLowerCase()
      return home.includes(vLower) || away.includes(vLower) || 
             vLower.includes(home.substring(0, 5)) || vLower.includes(away.substring(0, 5))
    })

    // Si no hay coincidencias exactas, devolvemos los primeros 5 del local para que el admin elija
    const finalFixtures = coincidencias.length > 0 ? coincidencias : fixtures.slice(0, 5)

    const resultados = await Promise.all(finalFixtures.map(async (f: any) => {
      const [eLocal, eVisitante] = await Promise.all([
        buscarEscudo(f.teams.home.name),
        buscarEscudo(f.teams.away.name),
      ])
      
      return {
        fixture_id: f.fixture.id,
        hora_utc: f.fixture.date,
        local: f.teams.home.name,
        visitante: f.teams.away.name,
        escudo_local: eLocal,
        escudo_visitante: eVisitante,
      }
    }))

    return resultados
  } catch {
    return []
  }
}

export const REDIR_BASE = process.env.NEXT_PUBLIC_URL || ''

export function redirUrl(url: string, titulo: string): string {
  return `/r?url=${encodeURIComponent(url)}&t=${encodeURIComponent(titulo)}`
}
