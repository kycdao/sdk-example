import { FC, useCallback, useRef, useState } from "react"
import './button.scss'

export type ButtonProps = {
    onClick?: () => void
    className?: string
    label?: string
    hoverLabel?: string
}

export const Button: FC<ButtonProps> = ({ onClick, label = 'Submit', className, hoverLabel = 'Next' }) => {
    const ref = useRef<HTMLButtonElement>(null)
    const [innerHtml, setInnerHtml] = useState(label)

    const innerHtmlSetter = useCallback((label: string) =>() => {
        setInnerHtml(label)
    }, [])

    return <button ref={ref} onMouseEnter={innerHtmlSetter(hoverLabel)} onMouseLeave={innerHtmlSetter(label)}  className={`kyc-button ${className}`} onClick={onClick}>
        <span>
            {innerHtml}
        </span>
        <i className="material-icons arrow"> arrow_forward </i>
    </button>
}