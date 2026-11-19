import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 테스트마다 렌더링한 화면 정리 (Vitest globals 를 쓰지 않으므로 직접 등록)
afterEach(() => cleanup())
