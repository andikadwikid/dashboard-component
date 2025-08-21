import { CardWrapper } from "@/components/auth/card-wrapper"

const LoginForm = () => {
    return (
        <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don&apos;t have an account?"
            backButtonHref="/auth/register"
            showSocial
        >
            Login Form
        </CardWrapper>

    )
}

export default LoginForm