'use client'

import { useEffect } from 'react'
import Image from "next/image";
import {CommonSection, CommonSubHeading, CommonBtnButton} from '@/app/components/CommonTags'

export default function ErrorComponents({ error, reset }) {
    useEffect(() => {

        console.error(error)
    }, [error])

    return (
        <>
            <CommonSection  styleClass="not-found">
                <div className="content flex flex-col justify-center items-center ">
                    <Image src={`/images/admin/not-found-image.jpg`} alt="Thank you" height={253} width={314} />
                    <CommonSubHeading 
                        text="Error Page Something went wrong!"
                        styleClass="mt-6 lg:mt-12"
                    />
                    <CommonBtnButton onClick={() => reset()}
                        styleClass="mt-4 lg:mt-6"
                        text="Try again"
                    />
                </div>
          </CommonSection>
        </>
    )
}