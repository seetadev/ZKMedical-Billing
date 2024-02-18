import Divider from "./divider"

export type StepperProps = {
  step: number
  onPrevClick?: () => void
  onNextClick?: () => void
}

export default function Stepper({
  step,
  onPrevClick,
  onNextClick
}: StepperProps) {
  return (
    <div>
      <Divider />
      <div className="flex justify-between mb-3">
        {onPrevClick !== undefined ? (
          <button
            className=""
            disabled={!onPrevClick}
            onClick={onPrevClick || undefined}
          >
            Prev
          </button>
        ) : (
          <span></span>
        )}
        <p>{step.toString()}/3</p>
        {onNextClick !== undefined ? (
          <button
            className=""
            disabled={!onNextClick}
            onClick={onNextClick || undefined}
          >
            Next
          </button>
        ) : (
          <span></span>
        )}
      </div>
    </div>
  )
}
