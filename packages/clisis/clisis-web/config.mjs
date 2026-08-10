const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://ClisisCoder.ai" : `https://${stage}.clisis-coder.ai`,
  console: stage === "production" ? "https://ClisisCoder.ai/auth" : `https://${stage}.clisis-coder.ai/auth`,
  email: "contact@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/AidosOS/demotic-clisis-coder",
  discord: "https://ClisisCoder.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}
