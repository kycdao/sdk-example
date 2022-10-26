import { useContext, useCallback, useMemo, FC, useEffect, useState } from "react"
import { Input } from "../components/input/input.component"
import { StateContext, StepID, DataActionTypes, HeaderButtons } from "../components/stateContext"
import { Step, StepAnimation } from "../components/step/step"
import { SubmitButton } from "../components/submitButton/submitButton"

const emailRegex = /^[^@]+@[a-z0-9-]+.[a-z]+$/

export const EmailDiscordVerificationStep: FC<{ className?: string, animation?: StepAnimation, disabled?: boolean }> = ({ className, animation, disabled = false }) => {
    const { data: { onPrev, email, onNext }, dispatch } = useContext(StateContext)
    const [autoFocus, setAutoFocus] = useState(false)

    const animationDone = useCallback(() => {
        setAutoFocus(true)
    }, [])

    useEffect(() => {
        if (!disabled) {
            const prev = onPrev.subscribe(() =>
                dispatch({ payload: { current: StepID.verificationStep, next: StepID.emailDiscordVerificationStep }, type: DataActionTypes.changePage }))
            return prev.unsubscribe.bind(prev)
        }
    }, [disabled])

    const disableSubmit = useMemo(() => {
        return !emailRegex.test(email)
    }, [email])

    useEffect(() => {
        if (!disabled) {
            dispatch({ payload: { button: HeaderButtons.next, state: disableSubmit ? 'hidden' : 'enabled' }, type: DataActionTypes.SetHeaderButtonState })
        }
    }, [disableSubmit, disabled])

    const onSubmit = useCallback(() => {
        if (!disableSubmit) {
            dispatch({ type: DataActionTypes.changePage, payload: { current: StepID.taxResidenceStep, prev: StepID.emailDiscordVerificationStep } })
        }
    }, [disableSubmit])

    useEffect(() => {
        if (!disabled) {
            const next = onNext.subscribe(onSubmit)
            return next.unsubscribe.bind(next)
        }
    }, [disableSubmit, disabled])

    const onEmailChange = useCallback((value: string) => {
        dispatch({ payload: value, type: DataActionTypes.emailChange })
    }, [])

    return <Step onAnimationDone={animationDone} disabled={disabled}  animation={animation} className={className} onEnter={onSubmit} footer={
        (disabled) =>
            <>
                <Input autoFocus={autoFocus} disabled={disabled} value={email} placeholder={"email"} className="full-width" onChange={onEmailChange} />
                <SubmitButton disabled={disableSubmit} className="full-width blue" onClick={onSubmit} />
            </>
    }>
        <h1 className="h1">03 - Email / Discord verification</h1>
        <p className="p">Verify your email / discord via the magic link sent to your address.</p>
    </Step>
}
