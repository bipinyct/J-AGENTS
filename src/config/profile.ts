export const profile = {
  fullName: "Bipin Singh",
  email: "bipinkainbox@gmail.com",
  phone: "+91 7991702806",
  location: {
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    willingToRelocate: true,
  },
  linkedin: "https://linkedin.com/in/bipinyct",
  github: "https://github.com/bipinyct",

  education: {
    degree: "B.Tech Electronics Engineering",
    institute: "Harcourt Butler Technical University, Kanpur",
    graduationYear: 2025,
    cgpa: 7.5,
  },

  currentRole: {
    title: "SDET-1",
    company: "Infinite Locus",
    location: "Gurugram",
    startedOn: "2025-01",
  },

  yearsOfExperience: 1.5,

  skills: {
    languages: ["JavaScript", "TypeScript", "C++", "SQL"],
    automation: ["Playwright"],
    api: ["Postman", "REST APIs", "k6", "Grafana", "Prometheus", "Loki", "Charles Proxy"],
    backend: ["Node.js", "Express.js", "GraphQL"],
    aiTools: ["AI Testing", "LLM Testing", "MCP", "Claude AI", "ChatGPT"],
    cicd: ["GitHub", "CI/CD", "JIRA"],
    process: ["SDLC", "STLC"],
    testingTypes: [
      "Automation",
      "API",
      "Regression",
      "Sanity",
      "Performance (Load/Stress/Spike/Soak)",
      "Cross-Browser",
      "Microservices",
    ],
    platforms: ["Web"],
    databases: ["MongoDB", "SQL"],
  },

  strengths: [
    "Designed a scalable Playwright automation framework (POM, fixtures, reusable utilities, API validations), cutting manual regression effort by 40%",
    "Executed load, stress, spike, and soak testing with k6, monitored via Grafana/Prometheus/Loki to surface latency and infra bottlenecks",
    "Owned end-to-end QA across sprint cycles: test planning, execution, regression, automation, defect triage, release sign-off",
    "API testing with Postman plus SQL backend validation for UI-API-database consistency",
    "Validated GrowthBook feature flags and A/B experiments — goal metrics, segmentation, rollout behaviour",
  ],
} as const;

export type Profile = typeof profile;
