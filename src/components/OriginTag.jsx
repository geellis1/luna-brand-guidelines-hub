// Small tag for Round 2 logos carried over from Round 1; hover shows which one.
export function OriginTag({ item }) {
  const from = item?.data?.fromRound1
  if (!from) return null
  return (
    <span className="origin-tag" title={`Carried over from Round 1 (was ${from})`}>
      From Round 1
    </span>
  )
}
