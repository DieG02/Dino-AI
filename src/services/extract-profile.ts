export default (): string => {
  return `
  Extract the following details from this LinkedIn-style profile description as JSON. 
  Focus ONLY on these fields (ignore others):
  - role (e.g., "Frontend Developer")
  - industry (e.g., "Web Development")
  - goal (e.g., "Seeking remote jobs in EU")
  - techStack (array of technologies, e.g., ["React", "Node.js"])
  - languages (array of languages, omit if not mentioned)

  Return JSON ONLY, like this:
  { "role": "...", "industry": "...", "goal": "...", "techStack": [], "languages": [] }
  `;
};
