import { toast } from 'react-hot-toast';
export const TostSuccess = (message, position = "top-center") => {
    return toast.success(message, {
        position: position
    })

}
export const TostError = (message, position = "top-center") => {
    return toast.error(message, {
        position: position
    })

}