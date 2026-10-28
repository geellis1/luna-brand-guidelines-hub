import { authorName, initials } from '../lib/format'
import { HeartIcon, XIcon } from './Icons'

// One small tag per person: icon + their initial. Your own tags are dark,
// everyone else's light, so two people's reactions read side by side.
export function ReactionTags({ reactions, user }) {
  if (!reactions.length) return null
  return (
    <span className="reaction-tags">
      {reactions.map((r) => {
        const name = authorName(r.author)
        const mine = r.user_id === user?.id
        const verb = r.reaction === 'heart' ? 'loves' : 'rules out'
        return (
          <span
            key={r.id}
            className={`reaction-tag${mine ? ' reaction-tag--mine' : ''}`}
            title={`${mine ? 'You' : name} ${mine ? (r.reaction === 'heart' ? 'love' : 'rule out') : verb} this`}
          >
            {r.reaction === 'heart' ? <HeartIcon filled size={12} /> : <XIcon size={12} />}
            <span>{initials(name)}</span>
          </span>
        )
      })}
    </span>
  )
}
