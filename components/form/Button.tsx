import { Button } from "../ui/button"

type btnSize = 'default' | 'lg' | 'sm'

type SubmitButtonProps = {
    className?: string
    size?: btnSize
    text?: string
}

export const SubmitButton = ({ className, size, text }:
    SubmitButtonProps) => {

    return (
        <Button>{text}</Button>
    )
}
