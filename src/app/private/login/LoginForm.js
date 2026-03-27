"use client"
import { usePostApi } from '@/app/lib/apicallHooks';
import { useAuthStore } from '@/app/store/auth.store';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Image from 'next/image';
import { useForm } from "react-hook-form";
const LoginForm = () => {

    const {
        register,
        handleSubmit: reactFormSubmit,
        formState: { errors },
    } = useForm();



    const { login } = useAuthStore();
    const { error, doPostRedirect, isLoading } = usePostApi("/administrator/user/login");

    const setUserDetails = (data = {}) => {
        if (data.success) {
            login(data.data, data.tokenExpiry, data.refreshTokenExpiry);
        }
    }

    const loginHandlar = async (data) => {
        try {
            doPostRedirect(data, "/admin/dashboard", false, setUserDetails)
        } catch (error) {
        }
    }

    return (
        <>
            <form onSubmit={reactFormSubmit(loginHandlar)}>
                <div className="login-form">
                    <div className="login-form-logo">
                        <Image priority src="/images/admin/logo.webp" alt="logo" width={270} height={75} />
                    </div>
                    <div className="login-form-holder">
                        <div className='input-icon'>
                            <PersonIcon />
                            <input
                                name='email'
                                type="text"
                                className="login-form-control"
                                placeholder="Email"
                                {...register("email", {
                                    required: true,
                                    pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                    validate: {
                                        notOnlySpaces: (value) => value.trim() !== "",
                                    },
                                })}
                            />
                        </div>
                        {errors.email && errors.email.type === "required" && (
                            <p className='login-error'>Email is required.</p>
                        )}
                        {errors.email && errors.email.type === "notOnlySpaces" && (
                            <p className='login-error'>Email is required.</p>
                        )}
                        {errors.email && errors.email.type === "pattern" && (
                            <p className='login-error'>Invalid Email</p>
                        )}
                    </div>
                    <div className="login-form-holder">
                        <div className='input-icon'>
                            <LockIcon />
                            <input
                                type="password"
                                className="login-form-control"
                                placeholder="Password"
                                name='password'
                                {...register("password", {
                                    required: true,
                                    validate: {
                                        notOnlySpaces: (value) => value.trim() !== "",
                                    },
                                })}
                            />
                        </div>
                        {errors.password && errors.password.type === "required" && (
                            <p className='login-error'>Password is required.</p>
                        )}
                        {errors.password && errors.password.type === "notOnlySpaces" && (
                            <p className='login-error'>Password is required.</p>
                        )}
                    </div>
                    {error && <p className='login-error'>{error}</p>}

                    <div className="login-buttons">
                        {isLoading ? (
                            <button className="login-button" disabled>
                                <span>Loading...</span>
                            </button>
                        ) : (
                            <button className="login-button" type='submit'>
                                <span>Login Here</span>
                            </button>
                        )}
                    </div>

                </div>
            </form>
        </>
    )
}

export default LoginForm