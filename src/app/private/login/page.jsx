import "./login.css"
import Image from 'next/image'
import LoginForm from './LoginForm'
import TokenRefreshHandler from '@/app/components/auth/TokenRefreshHandler'

const Login = () => {
    return (
        <div className="login-wrapper">
            <TokenRefreshHandler />
            <div className="login-inner-wrapper">
                <LoginForm />
                
            </div>
        </div>
    )
}

export default Login