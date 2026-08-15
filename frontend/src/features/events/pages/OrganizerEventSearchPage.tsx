import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchCatalog } from '../api/events.api'
import type { CatalogItem } from '../types'
import { formatEventDate } from '../utils/format'
import { getCatalogSearchErrorMessage } from '../utils/error-message'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'

export function OrganizerEventSearchPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<CatalogItem[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSearching(true)
    setErrorMessage(null)
    setHasSearched(true)

    try {
      const data = await searchCatalog(keyword)
      setResults(data)
    } catch (error) {
      setResults([])
      setErrorMessage(getCatalogSearchErrorMessage(error))
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectItem(item: CatalogItem) {
    navigate('/organizer/events/new/form', {
      state: { catalogItem: item },
    })
  }

  return (
    <main className="min-h-screen bg-kraft p-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/organizer/events"
          className="font-body text-sm text-stage-violet underline-offset-2 hover:underline"
        >
          ← Voltar para meus eventos
        </Link>

        <article className="mt-4 bg-paper px-8 py-7 shadow-sm">
          <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
            Buscar no catálogo
          </h1>
          <p className="mt-1 font-body text-sm text-ink/70">
            Encontre um evento na Ticketmaster para importar
          </p>

          <PerforatedDivider notchColor="bg-paper" className="my-5" />

          <form className="flex flex-wrap gap-3" onSubmit={handleSearch}>
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nome do evento, artista ou local"
              className="min-w-0 flex-1 border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSearching ? 'Buscando…' : 'Buscar'}
            </button>
          </form>

          {errorMessage ? (
            <p className="mt-4 font-body text-sm text-stub-red">{errorMessage}</p>
          ) : null}

          {hasSearched && !isSearching && !errorMessage && results.length === 0 ? (
            <p className="mt-6 font-body text-sm text-ink/70">
              Nenhum resultado encontrado. Tente outro termo de busca.
            </p>
          ) : null}

          <ul className="mt-6 space-y-4">
            {results.map((item) => (
              <li key={item.externalId}>
                <button
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="flex w-full gap-4 border border-perf-grey/60 bg-kraft/20 p-4 text-left transition-colors hover:bg-kraft/40"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-20 w-20 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-perf-grey/30 font-display text-xs uppercase text-ink/50">
                      Sem foto
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-lg uppercase text-ink">
                      {item.name}
                    </h2>
                    <p className="mt-1 font-body text-sm text-ink/70">
                      {formatEventDate(item.date)}
                      {item.venueName ? ` · ${item.venueName}` : ''}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </main>
  )
}
