import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div className="container">
        <h1>🚀 React Docker App</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            카운트는 {count}
          </button>
          <p>
            Docker로 빌드된 React 앱입니다!
          </p>
        </div>
        <div className="info">
          <p>환경: {import.meta.env.MODE}</p>
          <p>Vite + React로 구축되었습니다.</p>
        </div>
      </div>
    </div>
  )
}

export default App

