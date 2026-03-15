import { getOrigin } from "./url";

export const metatag = async ({
  title,
  url,
  robots = "index, follow",
  keywords = [],
  description,
}: {
  title: string;
  url: string;
  robots?: string;
  keywords?: string[];
  description?: string;
}) => {
  const origin = await getOrigin();
  const fav = `${origin}/favicons/favicon.svg`;

  const fixedKeywords: string[] = [];

  const margedkeywords: string[] = fixedKeywords.concat(keywords);

  const m: any = {
    title: title,
    canonical: url,
    keywords: margedkeywords,
    openGraph: {
      title: title,
      url: url,
      siteName: title,
      images: [
        {
          url: fav,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      title: title,
      images: [fav],
    },
    alternates: {
      canonical: url,
      languages: { "en-US": url },
    },
    robots: robots,
    structuredData: {
      name: title,
      url: url,
    },
  };

  if (description) m.description = description;
  return m;
};
