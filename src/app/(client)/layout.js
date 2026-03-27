

export default function FrontEndLayout({ children }) {
    return (
        <>
            {children}
        </>
    );
}

export const dynamic = 'force-dynamic'
export const revalidate = 0