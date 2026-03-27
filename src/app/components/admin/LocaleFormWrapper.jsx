"use client";
import { useState, useCallback } from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import DetailsPageLayout from "./layout/DetailsPageLayout";
import { axiosInstance } from "@/app/config/axiosInstance";
import { TostError } from "@/app/utils/tost/Tost";

const LocaleFormWrapper = ({
    locales = ["en"],
    redirectUrl,
    ModalID,
    Page_Fields,
    createdAt,
    updatedAt,
    useFullLinks,
    detailPage,
    getUrl,
    formProps = {},
    FormComponent,
}) => {
    const [locale, setLocale] = useState("en");
    const [localeData, setLocaleData] = useState(null);
    const [localeLoading, setLocaleLoading] = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [seoData, setSeoData] = useState(formProps?.DEFAULT_OBJECT?.seo ?? null);

    const handleLocaleChange = useCallback(async (newLocale) => {
        setLocale(newLocale);

        if (!getUrl) return;

        if (newLocale === "en") {
            setLocaleData(null);
            setIsFallback(false);
            return;
        }

        setLocaleLoading(true);
        try {
            const { generateApiAccessToken } = await import('@/app/lib/auth.improved.js');
            const token = await generateApiAccessToken();
            const { data: res } = await axiosInstance.get(
                `${getUrl}?lang=${newLocale}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res?.success) {
                setLocaleData(res.data);
                setIsFallback(!!res.isFallback);
            }
        } catch (err) {
            TostError("Failed to load translation");
        } finally {
            setLocaleLoading(false);
        }
    }, [getUrl]);

    const localeBar = (
        <LocaleSwitcher
            locales={locales}
            value={locale}
            onChange={handleLocaleChange}
            isFallback={isFallback}
        />
    );

    return (
        <DetailsPageLayout
            redirectUrl={redirectUrl}
            ModalID={ModalID}
            Page_Fields={Page_Fields}
            createdAt={createdAt}
            updatedAt={updatedAt}
            useFullLinks={useFullLinks}
            localeBar={localeBar}
            detailPage={detailPage}
            seoData={seoData}
        >
            {FormComponent && (
                <FormComponent
                    {...formProps}
                    locale={locale}
                    localeData={localeData}
                    localeLoading={localeLoading}
                    isFallback={isFallback}
                    onSeoChange={setSeoData}
                />
            )}
        </DetailsPageLayout>
    );
};

export default LocaleFormWrapper;
