"use client";
import { useState, useCallback, useRef } from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import DetailsPageLayout from "./layout/DetailsPageLayout";
import TranslationModal from "./TranslationModal";
import { axiosInstance } from "@/app/config/axiosInstance";
import { TostError } from "@/app/utils/tost/Tost";
import ALL_LOCALES from "@/app/utils/db/internationalization.db.json";

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
    const [showTranslationModal, setShowTranslationModal] = useState(false);
    // Ref to the FormComponent's setFormData — injected via callback prop
    const applyTranslationRef = useRef(null);

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
            onTranslateClick={() => setShowTranslationModal(true)}
        />
    );

    const targetLocaleInfo = ALL_LOCALES.find((l) => l.code === locale) ?? { name: locale };

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
                    onRegisterApplyTranslation={(fn) => { applyTranslationRef.current = fn; }}
                />
            )}

            {showTranslationModal && locale !== "en" && (
                <TranslationModal
                    open={showTranslationModal}
                    onClose={() => setShowTranslationModal(false)}
                    formData={applyTranslationRef.current?.getFormData?.() ?? formProps?.DEFAULT_OBJECT ?? {}}
                    targetLang={locale}
                    targetLangName={targetLocaleInfo.name}
                    Page_Fields={Page_Fields}
                    onApply={(updatedData) => {
                        if (applyTranslationRef.current?.setFormData) {
                            applyTranslationRef.current.setFormData(updatedData);
                        }
                    }}
                />
            )}
        </DetailsPageLayout>
    );
};

export default LocaleFormWrapper;
