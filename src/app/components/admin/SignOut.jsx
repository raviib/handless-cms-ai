"use client";
import { useGetApi } from '@/app/lib/apicallHooks';
import { useAuthStore } from '@/app/store/auth.store';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useRouter } from 'next/navigation';
const SignOut = () => {
    const { error, doFetch, isLoading } = useGetApi();
    const { logout } = useAuthStore();
    const router = useRouter();
    
    const handleLogout = () => {
        try {
            doFetch('/administrator/user/logout'); // Delete all cookies
            logout(); // Clear Zustand store
            router.push('/private/login'); // Redirect to the login page
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    return (
        <div onClick={() => handleLogout()} className='sign-out-d'>
            <ExitToAppIcon />
            <button >Sign Out</button>
        </div>
    )
}

export default SignOut