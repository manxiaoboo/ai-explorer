/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://aitools.example.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    additionalSitemaps: [
      "https://aitools.example.com/sitemap.xml",
    ],
  },
  exclude: ["/api/*", "/admin/*"],
};
