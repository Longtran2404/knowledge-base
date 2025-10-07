import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const defaultSEO = {
  siteName: 'Nam Long Center',
  defaultTitle: 'Nam Long Center - Học viện đào tạo trực tuyến hàng đầu',
  defaultDescription:
    'Nam Long Center cung cấp các khóa học chất lượng cao về lập trình, kinh doanh, marketing và nhiều lĩnh vực khác. Học từ chuyên gia, thực hành thực tế, nhận chứng chỉ.',
  defaultKeywords: [
    'nam long center',
    'khóa học online',
    'học lập trình',
    'học kinh doanh',
    'đào tạo trực tuyến',
    'chứng chỉ',
  ],
  defaultImage: '/images/og-image.png',
  siteUrl: process.env.REACT_APP_URL || 'https://namlongcenter.com',
  twitterHandle: '@namlongcenter',
  facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID,
};

export function SEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOProps) {
  const pageTitle = title
    ? `${title} | ${defaultSEO.siteName}`
    : defaultSEO.defaultTitle;

  const pageDescription = description || defaultSEO.defaultDescription;

  const pageKeywords = [
    ...defaultSEO.defaultKeywords,
    ...keywords,
    ...tags,
  ].join(', ');

  const pageImage = image
    ? image.startsWith('http')
      ? image
      : `${defaultSEO.siteUrl}${image}`
    : `${defaultSEO.siteUrl}${defaultSEO.defaultImage}`;

  const pageUrl = url
    ? `${defaultSEO.siteUrl}${url}`
    : defaultSEO.siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      {author && <meta name="author" content={author} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={defaultSEO.siteName} />
      {defaultSEO.facebookAppId && (
        <meta property="fb:app_id" content={defaultSEO.facebookAppId} />
      )}

      {/* Article specific */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={pageImage} />
      {defaultSEO.twitterHandle && (
        <meta property="twitter:site" content={defaultSEO.twitterHandle} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="Vietnamese" />
      <meta name="revisit-after" content="7 days" />

      {/* Geo tags */}
      <meta name="geo.region" content="VN" />
      <meta name="geo.placename" content="Vietnam" />

      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: pageTitle,
          description: pageDescription,
          url: pageUrl,
          image: pageImage,
          ...(type === 'article' && {
            headline: title,
            author: author ? { '@type': 'Person', name: author } : undefined,
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
          }),
        })}
      </script>
    </Helmet>
  );
}

// Preset SEO configurations for common pages

export function SEOHomePage() {
  return (
    <SEO
      description="Khám phá hàng nghìn khóa học chất lượng cao tại Nam Long Center. Học từ chuyên gia, thực hành thực tế, nhận chứng chỉ được công nhận."
      keywords={[
        'học online',
        'khóa học trực tuyến',
        'đào tạo nghề',
        'học lập trình',
        'học marketing',
      ]}
      url="/"
    />
  );
}

export function SEOCoursesPage() {
  return (
    <SEO
      title="Khóa học"
      description="Danh sách các khóa học tại Nam Long Center. Tìm khóa học phù hợp với bạn từ lập trình, kinh doanh, marketing đến thiết kế."
      keywords={['khóa học', 'danh sách khóa học', 'học trực tuyến']}
      url="/courses"
    />
  );
}

export function SEOCoursePage({
  title,
  description,
  image,
  slug,
  tags,
}: {
  title: string;
  description: string;
  image?: string;
  slug: string;
  tags?: string[];
}) {
  return (
    <SEO
      title={title}
      description={description}
      image={image}
      url={`/courses/${slug}`}
      type="product"
      keywords={['khóa học', ...(tags || [])]}
      tags={tags}
    />
  );
}

export function SEOProfilePage() {
  return (
    <SEO
      title="Hồ sơ của tôi"
      description="Quản lý thông tin cá nhân, khóa học đã đăng ký và theo dõi tiến độ học tập của bạn."
      url="/profile"
    />
  );
}

export function SEOLoginPage() {
  return (
    <SEO
      title="Đăng nhập"
      description="Đăng nhập vào Nam Long Center để tiếp tục học tập và phát triển kỹ năng của bạn."
      url="/login"
    />
  );
}

export function SEORegisterPage() {
  return (
    <SEO
      title="Đăng ký"
      description="Tạo tài khoản miễn phí tại Nam Long Center và bắt đầu hành trình học tập của bạn ngay hôm nay."
      url="/register"
    />
  );
}

export function SEOAboutPage() {
  return (
    <SEO
      title="Giới thiệu"
      description="Tìm hiểu về Nam Long Center - Nền tảng đào tạo trực tuyến hàng đầu Việt Nam với sứ mệnh mang kiến thức chất lượng đến mọi người."
      url="/about"
    />
  );
}

export function SEOContactPage() {
  return (
    <SEO
      title="Liên hệ"
      description="Liên hệ với đội ngũ hỗ trợ của Nam Long Center. Chúng tôi luôn sẵn sàng giải đáp thắc mắc và hỗ trợ bạn."
      url="/contact"
    />
  );
}

export function SEOBlogPage() {
  return (
    <SEO
      title="Blog"
      description="Đọc các bài viết hữu ích về học tập, phát triển kỹ năng và xu hướng công nghệ tại blog Nam Long Center."
      keywords={['blog', 'bài viết', 'kiến thức', 'chia sẻ']}
      url="/blog"
    />
  );
}

export function SEOBlogPostPage({
  title,
  description,
  image,
  slug,
  author,
  publishedTime,
  tags,
}: {
  title: string;
  description: string;
  image?: string;
  slug: string;
  author?: string;
  publishedTime?: string;
  tags?: string[];
}) {
  return (
    <SEO
      title={title}
      description={description}
      image={image}
      url={`/blog/${slug}`}
      type="article"
      author={author}
      publishedTime={publishedTime}
      tags={tags}
    />
  );
}
