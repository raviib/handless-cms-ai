'use client'
import Link from 'next/link'
import "@/app/styles/admin/breadcrumb.scss"

const Breadcrumb = ({ links = [], styleClass = '' }) => {
    return (
        <section className={`breadcrumb ${styleClass}`}>
            <div>
                <ul>
                    <li>
                        <Link href="/">Home</Link>
                    </li>

                    {links.map((value, index) => {
                        const isLast = index === links.length - 1

                        return (
                            <li key={`${value.Name}-${index}`}>
                                {isLast ? (
                                    value.Name
                                ) : (
                                    <Link href={value.link}>
                                        {value.Name}
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}

export default Breadcrumb
