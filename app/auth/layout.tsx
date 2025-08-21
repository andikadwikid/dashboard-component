
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full flex items-center justify-center bg-radial-[at_25%_25%] from-blue-400 to-blue-800 to-75%">
            {children}
        </div>
    )
}

export default AuthLayout