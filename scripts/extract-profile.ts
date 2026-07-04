// scripts/extract-profile.ts

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();

interface ProfileEntry {
  text: string;
  category: string;
}

interface ProfileData {
  identity: { text: string }[];
  skills: { name: string; category?: string }[];
  experience: { company: string; description: string; role?: string; dates?: string }[];
  education: { program: string; status: string; details: string[] }[];
  projects: { name: string; description: string }[];
  personal: { text: string }[];
  links: { url: string }[];
}

const MAPS_DIR = path.join(PROJECT_ROOT, 'src', 'configs', 'maps');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src', 'configs', 'profile.json');

const COMPANY_NAMES = ['PassionGeek', 'G-Next', 'Host Myanmar'];

function readFileAsText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function extractSkills(content: string): { name: string }[] {
  const skills: { name: string }[] = [];
  // Match: label: "SkillName"
  const labelRegex = /label:\s*(["'`])(.+?)\1/g;
  let match;
  while ((match = labelRegex.exec(content)) !== null) {
    const name = match[2];
    // Skip duplicates
    if (!skills.find(s => s.name === name)) {
      skills.push({ name });
    }
  }
  return skills;
}

function extractInteractions(content: string): { title?: string; texts: string[] }[] {
  const results: { title?: string; texts: string[] }[] = [];
  // Find all interactionBox blocks with title + textLines
  const interactionBoxRegex = /type:\s*["'`]interactionBox["'`]\s*[\s\S]*?title:\s*(["'`])(.+?)\1[\s\S]*?textLines:\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = interactionBoxRegex.exec(content)) !== null) {
    const title = match[2];
    const textLinesBlock = match[3];
    const texts: string[] = [];
    // Extract each backtick-quoted string from the textLines array
    const textRegex = /`(.+?)`/g;
    let textMatch;
    while ((textMatch = textRegex.exec(textLinesBlock)) !== null) {
      texts.push(textMatch[1]);
    }
    results.push({ title, texts });
  }
  return results;
}

function extractMessages(content: string): string[] {
  const messages: string[] = [];
  // Match message-type interactions with text
  const msgRegex = /type:\s*["'`]message["'`]\s*,\s*\n\s*text:\s*(`.+?`|["'](.+?)["'])/g;
  let match;
  while ((match = msgRegex.exec(content)) !== null) {
    const raw = match[1];
    // Strip surrounding backticks or quotes
    const text = raw.replace(/^`|`$/g, '').replace(/^["']|["']$/g, '');
    messages.push(text);
  }
  return messages;
}

function extractLinks(content: string): string[] {
  const links: string[] = [];
  // Match URLs in backtick-quoted text (links in interactions)
  const urlRegex = /(https?:\/\/[^\s`'"]+)/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    if (!links.includes(match[0])) {
      links.push(match[0]);
    }
  }
  return links;
}

function buildProfile(): ProfileData {
  const profile: ProfileData = {
    identity: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    personal: [],
    links: [],
  };

  const mapFiles = fs.readdirSync(MAPS_DIR).filter(f => f.endsWith('.ts'));

  for (const file of mapFiles) {
    const filePath = path.join(MAPS_DIR, file);
    const content = readFileAsText(filePath);

    // Extract skills from techskills map
    if (file.includes('techskills')) {
      profile.skills = extractSkills(content);
    }

    // Extract from outside.ts (experience, education, projects, links, personal)
    if (file === 'outside.ts') {
      // Companies
      const interactions = extractInteractions(content);
      for (const interaction of interactions) {
        const title = interaction.title || '';

        // Check if title matches a known company
        const company = COMPANY_NAMES.find(c => title.includes(c));
        if (company) {
          const allText = interaction.texts.join(' ');
          const existing = profile.experience.find(e => e.company === company);
          if (existing) {
            // Append additional text lines
            existing.description += ' ' + allText;
          } else {
            const datesMatch = title.match(/\((.+?)\)/);
            const dates = datesMatch ? datesMatch[1] : '';
            // Extract role from first text line if it contains "As a"
            const roleMatch = allText.match(/As a (.+?) at /);
            const role = roleMatch ? roleMatch[1] : undefined;
            profile.experience.push({
              company,
              description: allText,
              role,
              dates,
            });
          }
        }

        // Check if title matches education
        if (title.includes('Degree') || title.includes('Computer Science')) {
          profile.education.push({
            program: 'NCC Education (L5DC)',
            status: 'In progress — second year',
            details: interaction.texts,
          });
        }

        // Check if title matches projects
        if (title.includes('Projects')) {
          for (const text of interaction.texts) {
            // Each text line is a project: "ProjectName: description"
            const colonIdx = text.indexOf(':');
            if (colonIdx > 0) {
              profile.projects.push({
                name: text.substring(0, colonIdx).trim(),
                description: text.substring(colonIdx + 1).trim(),
              });
            } else {
              profile.projects.push({
                name: text.substring(0, 40),
                description: text,
              });
            }
          }
        }
      }

      // Links
      const links = extractLinks(content);
      for (const url of links) {
        profile.links.push({ url });
      }

      // Personal statements from message interactions
      const messages = extractMessages(content);
      const personalPattern = /^I (enjoy|built|love|wanted|am|can|occasionally)/i;
      for (const msg of messages) {
        if (personalPattern.test(msg)) {
          profile.personal.push({ text: msg });
        }
      }
    }
  }

  return profile;
}

function main(): void {
  console.log('Extracting profile data from map configs...');
  const profile = buildProfile();

  // Validate we got something useful
  if (profile.skills.length === 0) {
    console.error('ERROR: No skills extracted. Check the extraction script.');
    process.exit(1);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(profile, null, 2), 'utf-8');
  console.log(`Profile written to ${OUTPUT_FILE}`);
  console.log(`  Skills: ${profile.skills.length}`);
  console.log(`  Experience: ${profile.experience.length} companies`);
  console.log(`  Education: ${profile.education.length} entries`);
  console.log(`  Projects: ${profile.projects.length}`);
  console.log(`  Links: ${profile.links.length}`);
  console.log(`  Personal: ${profile.personal.length} statements`);
}

main();
