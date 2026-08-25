import { getErrorMessage } from '#/lib/api'

export interface QueryErrorStateProps {
  error: unknown
}

export function QueryErrorState({ error }: QueryErrorStateProps) {
  return (
    <div className="p-8 text-center text-brand-coral">
      Error: {getErrorMessage(error)}
    </div>
  )
}
