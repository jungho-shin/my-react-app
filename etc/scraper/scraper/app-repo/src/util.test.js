import { describe, expect, it } from 'vitest'
import { cellText, cleanConfig, emptyBot, fmtDuration, parseRoute, scheduleLabel } from './util.js'

describe('util', () => {
  it('주소(#/bots/3/edit?x=1)를 해석한다', () => {
    expect(parseRoute('#/bots/3/edit?template=table')).toEqual({ parts: ['bots', '3', 'edit'], query: { template: 'table' } })
    expect(parseRoute('').parts).toEqual([])
  })

  it('예약과 시간을 읽기 쉽게 표시한다', () => {
    expect(scheduleLabel('interval', '90')).toBe('90분마다')
    expect(scheduleLabel('interval', '120')).toBe('2시간마다')
    expect(scheduleLabel('interval', '1440')).toBe('1일마다')
    expect(scheduleLabel('daily', '09:00')).toBe('매일 09:00')
    expect(scheduleLabel('none', '')).toBe('예약 없음')
    expect(fmtDuration(59)).toBe('59초')
    expect(fmtDuration(125)).toBe('2분 5초')
  })

  it('표에 넣을 값을 문자열로 만든다', () => {
    expect(cellText(['a', 'b'])).toBe('a | b')
    expect(cellText(null)).toBe('')
    expect(cellText('x'.repeat(200))).toHaveLength(161)
  })

  it('저장 전에 빈 필드와 빈 주소를 정리한다', () => {
    const bot = emptyBot()
    bot.config.start_urls = [' https://a.test ', '']
    bot.config.fields = [{ ...bot.config.fields[0], name: ' 제목 ' }, { ...bot.config.fields[0], name: '' }]
    bot.config.key_fields = ['제목', '없는필드']
    const cfg = cleanConfig(bot.config)
    expect(cfg.start_urls).toEqual(['https://a.test'])
    expect(cfg.fields.map((f) => f.name)).toEqual(['제목'])
    expect(cfg.key_fields).toEqual(['제목'])
  })
})
