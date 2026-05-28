export function generateResumeHTML(data: any): string {
  const {
    personalInfo = {},
    summary = "",
    technicalSkills = {},
    experience = [],
    projects = [],
    education = [],
    certificationsAndAchievements = [],
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8" />

<style>
  :root {
    --text-main: #1f2937;
    --text-muted: #4b5563;
    --accent: #000000;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: var(--text-main);
    line-height: 1.5;
    font-size: 11pt;
    padding: 0;
    margin: 0;
  }

  h1 {
    font-size: 24pt;
    margin-bottom: 4px;
    text-align: center;
  }

  h2 {
    font-size: 13pt;
    text-transform: uppercase;
    border-bottom: 1px solid black;
    margin-top: 18px;
    margin-bottom: 8px;
    padding-bottom: 3px;
  }

  .contact-info {
    text-align: center;
    font-size: 10pt;
    color: var(--text-muted);
    margin-bottom: 15px;
  }

  .contact-info a {
    text-decoration: none;
    color: var(--text-muted);
  }

  .summary {
    text-align: justify;
  }

  .section-item {
    margin-bottom: 12px;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
  }

  .item-subheader {
    display: flex;
    justify-content: space-between;
    font-style: italic;
    font-size: 10pt;
    margin-bottom: 4px;
  }

  ul {
    margin: 0;
    padding-left: 18px;
  }

  li {
    margin-bottom: 4px;
    text-align: justify;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 6px;
  }

  .skill-category {
    font-weight: bold;
  }
</style>
</head>

<body>

<h1>${personalInfo.name || "Software Engineer"}</h1>

<div class="contact-info">
  ${personalInfo.email || ""}
  ${personalInfo.phone ? ` | ${personalInfo.phone}` : ""}
  ${
    personalInfo.linkedin
      ? ` | <a href="${personalInfo.linkedin}">LinkedIn</a>`
      : ""
  }
  ${
    personalInfo.github
      ? ` | <a href="${personalInfo.github}">GitHub</a>`
      : ""
  }
  ${
    personalInfo.portfolio
      ? ` | <a href="${personalInfo.portfolio}">Portfolio</a>`
      : ""
  }
</div>

${
  summary
    ? `
<h2>Professional Summary</h2>
<div class="summary">${summary}</div>
`
    : ""
}

<h2>Technical Skills</h2>

<div class="skills-grid">

${
  technicalSkills.languages?.length
    ? `
<div class="skill-category">Languages:</div>
<div>${technicalSkills.languages.join(", ")}</div>
`
    : ""
}

${
  technicalSkills.frontend?.length
    ? `
<div class="skill-category">Frontend:</div>
<div>${technicalSkills.frontend.join(", ")}</div>
`
    : ""
}

${
  technicalSkills.backendAndDatabases?.length
    ? `
<div class="skill-category">Backend & Databases:</div>
<div>${technicalSkills.backendAndDatabases.join(", ")}</div>
`
    : ""
}

${
  technicalSkills.toolsAndArchitecture?.length
    ? `
<div class="skill-category">Tools & Architecture:</div>
<div>${technicalSkills.toolsAndArchitecture.join(", ")}</div>
`
    : ""
}

</div>

${
  experience.length > 0
    ? `
<h2>Experience</h2>

${experience
  .map(
    (exp: any) => `
<div class="section-item">

  <div class="item-header">
    <span>${exp.role || ""}</span>
    <span>${exp.duration || ""}</span>
  </div>

  <div class="item-subheader">
    <span>${exp.company || ""}</span>
  </div>

  <ul>
    ${(exp.points || [])
      .map((point: string) => `<li>${point}</li>`)
      .join("")}
  </ul>

</div>
`
  )
  .join("")}
`
    : ""
}

${
  projects.length > 0
    ? `
<h2>Projects</h2>

${projects
  .map(
    (proj: any) => `
<div class="section-item">

  <div class="item-header">
    <span>
      ${proj.name || ""}
      ${
        proj.techStack
          ? ` | <span style="font-weight:normal;font-size:10pt;">${proj.techStack}</span>`
          : ""
      }
    </span>
  </div>

  <div class="item-subheader">
    <span>
      ${
        proj.liveUrl
          ? `<a href="${proj.liveUrl}">Live Demo</a>`
          : ""
      }

      ${
        proj.liveUrl && proj.repoUrl
          ? " | "
          : ""
      }

      ${
        proj.repoUrl
          ? `<a href="${proj.repoUrl}">Source Code</a>`
          : ""
      }
    </span>
  </div>

  <ul>
    ${(proj.points || [])
      .map((point: string) => `<li>${point}</li>`)
      .join("")}
  </ul>

</div>
`
  )
  .join("")}
`
    : ""
}

${
  education.length > 0
    ? `
<h2>Education</h2>

${education
  .map(
    (edu: any) => `
<div class="section-item">

  <div class="item-header">
    <span>${edu.institution || ""}</span>
    <span>${edu.duration || ""}</span>
  </div>

  <div class="item-subheader">
    <span>${edu.degree || ""}</span>
    <span>${edu.score || ""}</span>
  </div>

</div>
`
  )
  .join("")}
`
    : ""
}

${
  certificationsAndAchievements.length > 0
    ? `
<h2>Certifications & Achievements</h2>

<ul>
${certificationsAndAchievements
  .map((item: string) => `<li>${item}</li>`)
  .join("")}
</ul>
`
    : ""
}

</body>
</html>
`;
}