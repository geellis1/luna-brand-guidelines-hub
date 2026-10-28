import { useCallback, useState } from 'react'

// Selection lives in the query string so a combo can be shared as a link.
export function useUrlParam(name) {
  const [value, setValue] = useState(() => new URLSearchParams(window.location.search).get(name))

  const update = useCallback(
    (next) => {
      setValue(next)
      const url = new URL(window.location.href)
      if (next == null) url.searchParams.delete(name)
      else url.searchParams.set(name, next)
      window.history.replaceState(null, '', url)
    },
    [name],
  )

  return [value, update]
}
