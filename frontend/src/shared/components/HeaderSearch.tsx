import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20 16.65 16.65" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function HeaderSearch() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)

  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const isEventsListPage = location.pathname === '/events'
  const urlQuery = searchParams.get('q') ?? ''

  const closeSearch = useCallback(() => {
    setIsExpanded(false)

    if (!isEventsListPage) {
      setInputValue('')
    }
  }, [isEventsListPage])

  useEffect(() => {
    if (!isExpanded || !isEventsListPage) {
      return
    }

    setInputValue(urlQuery)
  }, [isExpanded, isEventsListPage, urlQuery])

  useEffect(() => {
    if (!isExpanded) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeSearch()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeSearch()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded, closeSearch])

  function openSearch() {
    setInputValue(isEventsListPage ? urlQuery : '')
    setIsExpanded(true)
  }

  function updateEventsQuery(value: string) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)

        if (value.trim()) {
          next.set('q', value)
        } else {
          next.delete('q')
        }

        return next
      },
      { replace: true },
    )
  }

  function handleChange(value: string) {
    setInputValue(value)

    if (isEventsListPage) {
      updateEventsQuery(value)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (isEventsListPage) {
      closeSearch()
      return
    }

    const params = new URLSearchParams()

    if (inputValue.trim()) {
      params.set('q', inputValue.trim())
    }

    const queryString = params.toString()
    navigate(queryString ? `/events?${queryString}` : '/events')
    setIsExpanded(false)
    setInputValue('')
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={openSearch}
        className="flex h-8 w-8 items-center justify-center text-paper/90 transition-opacity hover:text-paper"
        aria-label="Buscar eventos"
      >
        <SearchIcon />
      </button>
    )
  }

  return (
    <div ref={containerRef} className="flex items-center">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <label htmlFor="header-search" className="sr-only">
          Buscar eventos
        </label>
        <input
          id="header-search"
          type="search"
          value={inputValue}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Buscar eventos…"
          autoFocus
          className="w-44 border border-paper/20 bg-ink px-2 py-1.5 font-body text-sm text-paper outline-none placeholder:text-paper/50 focus:border-paper/40 sm:w-56"
        />
        <button
          type="button"
          onClick={closeSearch}
          className="flex h-8 w-8 items-center justify-center text-paper/90 transition-opacity hover:text-paper"
          aria-label="Fechar busca"
        >
          <CloseIcon />
        </button>
      </form>
    </div>
  )
}
