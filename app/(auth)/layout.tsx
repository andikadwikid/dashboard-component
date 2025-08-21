
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <nav>This is navbar without /auth prefix</nav>
            {children}
        </div>
    )
}

export default AuthLayout