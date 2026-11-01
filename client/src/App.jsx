import { Gamepad2, KeyRound, ShieldCheck } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-linear-to-b from-vault-900 to-vault-950">
      <header className="border-b border-vault-700 bg-vault-900/80">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <KeyRound className="size-6 text-neon-cyan" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-wide">KeyVault</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="max-w-2xl text-4xl font-bold sm:text-5xl">
          Licencias y videojuegos digitales, con{' '}
          <span className="text-neon-cyan">entrega inmediata</span>
        </h1>
        <p className="mt-4 max-w-xl text-vault-300">
          Compra tu key y actívala al momento en Steam, Epic o Xbox.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3 text-sm">
          <li className="flex items-center gap-2 rounded-lg border border-vault-700 bg-vault-800 px-4 py-2 shadow-glow">
            <Gamepad2 className="size-4 text-neon-violet" aria-hidden="true" />
            Catálogo multiplataforma
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-vault-700 bg-vault-800 px-4 py-2 shadow-glow">
            <ShieldCheck className="size-4 text-neon-green" aria-hidden="true" />
            Keys digitales
          </li>
        </ul>
      </main>
    </div>
  )
}

export default App
