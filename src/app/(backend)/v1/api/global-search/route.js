import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";

// Models
import about_us_pageSchema from "@/app/(backend)/models/cms/(pages)/about-us-page/about-us-page.modal.js";
import common_pageSchema from "@/app/(backend)/models/cms/(pages)/common-page/common-page.modal.js";
import csr_pageSchema from "@/app/(backend)/models/cms/(pages)/csr-page/csr-page.modal.js";
import home_pageSchema from "@/app/(backend)/models/cms/(pages)/home-page/home-page.modal.js";
import contact_us_pageSchema from "@/app/(backend)/models/cms/(pages)/contact-us-page/contact-us-page.modal.js";
import vigro_gold_club_pageSchema from "@/app/(backend)/models/cms/(pages)/vigro-gold-club-page/vigro-gold-club-page.modal.js";
import managing_directorsSchema from "@/app/(backend)/models/cms/(sections)/managing-directors/managing-directors.modal.js";
import eventSchema from "@/app/(backend)/models/cms/event/event.modal.js";
import blogSchema from "@/app/(backend)/models/cms/(media)/blog/blog.modal.js";
import corporate_responsibilitySchema from "@/app/(backend)/models/cms/(media)/corporate-responsibility/corporate-responsibility.modal.js";
import newsSchema from "@/app/(backend)/models/cms/(media)/news/news.modal.js";
import categorySchema from "@/app/(backend)/models/shop/category/category.modal.js";
import brand_catalogueSchema from "@/app/(backend)/models/shop/brand-catalogue/brand-catalogue.modal.js";
import productsSchema from "@/app/(backend)/models/shop/products/products.modal.js";
import brandsSchema from "@/app/(backend)/models/shop/brands/brands.modal.js";

export const revalidate = 0;
export const dynamic = "force-dynamic";

/**
 * Global Search API
 * GET /api/v1/global-search?q=keyword&limit=5&types=products,blog,news
 *
 * Query params:
 *  - q        : search keyword (required)
 *  - limit    : max results per source (default: 5)
 *  - types    : comma-separated list of sources to search (default: all)
 */
export async function GET(request) {
    try {
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q")?.trim();
        const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 20);
        const typesParam = searchParams.get("types");

        if (!q) {
            return NextResponse.json(
                { success: false, message: "Query parameter 'q' is required" },
                { status: 400 }
            );
        }

        const regex = { $regex: q, $options: "i" };

        // Define all searchable sources
        const allSources = {
            products: {
                model: productsSchema,
                query: { isActive: true, $or: [{ full_name: regex }, { name: regex }, { code: regex }] },
                select: "full_name name slug code image category",
                populate: [{ path: "category", select: "name slug" }],
            },
            blog: {
                model: blogSchema,
                query: { isActive: true, $or: [{ displayName: regex }, { name: regex }, { short_content: regex }] },
                select: "displayName name slug thumbnail_image short_content date",
            },
            news: {
                model: newsSchema,
                query: { isActive: true, $or: [{ name: regex }] },
                select: "name thumbnail_image url",
            },
            category: {
                model: categorySchema,
                query: { isActive: true, $or: [{ name: regex }] },
                select: "name slug",
            },
            brands: {
                model: brandsSchema,
                query: { isActive: true, $or: [{ displayName: regex }, { name: regex }, { short_description: regex }] },
                select: "displayName name slug logo image short_description",
            },
            "brand-catalogue": {
                model: brand_catalogueSchema,
                query: { isActive: true, $or: [{ displayName: regex }, { title: regex }] },
                select: "displayName title slug image",
                populate: [
                    { path: "brand", select: "name slug" },
                    { path: "category", select: "name slug" },
                ],
            },
            event: {
                model: eventSchema,
                query: { isActive: true, $or: [{ title: regex }, { name: regex }, { location: regex }] },
                select: "title name date location type thumbnail_image link",
            },
            "corporate-responsibility": {
                model: corporate_responsibilitySchema,
                query: { isActive: true, $or: [{ name: regex }, { content: regex }] },
                select: "name thumbnail_image date content",
            },
            "common-page": {
                model: common_pageSchema,
                query: { isActive: true, $or: [{ displayName: regex }, { name: regex }] },
                select: "displayName name slug",
            },
            "managing-directors": {
                model: managing_directorsSchema,
                query: { isActive: true, $or: [{ title: regex }, { sub_title: regex }, { "directors.name": regex }, { "directors.designation": regex }] },
                select: "title sub_title directors",
            },
            "about-us-page": {
                model: about_us_pageSchema,
                query: { isActive: true, $or: [{ "about_virgo_group.title": regex }, { "virgo_story.title": regex }, { "virgo_promise.title": regex }] },
                select: "about_virgo_group.title virgo_story.title virgo_promise.title",
            },
            "csr-page": {
                model: csr_pageSchema,
                query: { isActive: true, $or: [{ "csr_initiatives.title": regex }, { "csr_philosophy.title": regex }] },
                select: "csr_initiatives.title csr_initiatives.tagline csr_philosophy.title",
            },
            "home-page": {
                model: home_pageSchema,
                query: { isActive: true, $or: [{ "about_virgo_group.tagline": regex }, { "insights_and_inspiration.title": regex }] },
                select: "about_virgo_group.tagline insights_and_inspiration.title",
            },
            "contact-us-page": {
                model: contact_us_pageSchema,
                query: { isActive: true, $or: [{ "quick_contact.heading": regex }, { "get_in_touch.title": regex }] },
                select: "quick_contact.heading get_in_touch.title",
            },
            "vigro-gold-club-page": {
                model: vigro_gold_club_pageSchema,
                query: { isActive: true, $or: [{ "banner_section.title": regex }, { "faq_section.title": regex }, { "usp.title": regex }] },
                select: "banner_section.title faq_section.title usp.title",
            },
        };

        // Filter sources if 'types' param is provided
        const requestedTypes = typesParam
            ? typesParam.split(",").map((t) => t.trim()).filter((t) => allSources[t])
            : Object.keys(allSources);

        // Run all queries in parallel
        const results = await Promise.allSettled(
            requestedTypes.map(async (type) => {
                const source = allSources[type];
                let query = source.model.find(source.query).select(source.select).limit(limit).lean();

                if (source.populate) {
                    source.populate.forEach((p) => {
                        query = query.populate(p);
                    });
                }

                const data = await query;
                return { type, data, count: data.length };
            })
        );

        // Build response — include only fulfilled results with data
        const searchResults = {};
        let totalResults = 0;

        results.forEach((result, i) => {
            const type = requestedTypes[i];
            if (result.status === "fulfilled" && result.value.data.length > 0) {
                searchResults[type] = result.value.data;
                totalResults += result.value.count;
            }
        });

        return NextResponse.json({
            success: true,
            message: "Search completed",
            query: q,
            totalResults,
            data: searchResults,
        });
    } catch (error) {
        return errorHandler(error);
    }
}
