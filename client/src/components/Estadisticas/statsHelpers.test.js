import { describe, expect, it } from 'vitest'
import {
  buildPieBackground,
  buildPieSegments,
  calculateBarHeight,
  formatHours,
  formatMinutes,
  formatValue
} from './statsHelpers.js'

describe('statsHelpers', () => {
  it('formatMinutes muestra minutos con locale es-ES', () => {
    expect(formatMinutes(12345)).toBe(`${(12345).toLocaleString('es-ES')} min`)
  })

  it('formatHours convierte minutos a horas redondeadas', () => {
    expect(formatHours(48)).toBe('0.8h')
    expect(formatHours(120)).toBe('2h')
  })

  it('formatValue devuelve 0 para null', () => {
    expect(formatValue(null)).toBe('0')
  })

  it('buildPieSegments calcula porcentajes correctamente', () => {
    const segments = buildPieSegments(
      [{ genre: 'Drama', value: 2 }, { genre: 'Sci-Fi', value: 1 }],
      ['#111', '#222']
    )

    expect(segments).toEqual([
      { color: '#111', percentage: 66.66666666666666 },
      { color: '#222', percentage: 33.33333333333333 }
    ])
  })

  it('buildPieBackground crea un conic-gradient con segmentos', () => {
    const background = buildPieBackground([
      { color: '#111', percentage: 50 },
      { color: '#222', percentage: 50 }
    ])

    expect(background).toContain('conic-gradient')
    expect(background).toContain('#111 0% 50%')
    expect(background).toContain('#222 50% 100%')
  })

  it('calculateBarHeight respeta el minimo visual', () => {
    expect(calculateBarHeight(1, 100, 0.02)).toBe('2%')
    expect(calculateBarHeight(50, 100, 0.02)).toBe('50%')
    expect(calculateBarHeight(0, 100, 0.02)).toBe('0%')
  })
})
