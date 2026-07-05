const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\chess\\.gemini\\antigravity-ide\\brain\\d28b4d33-5f64-40eb-bfd3-7c1695d9c3da\\.system_generated\\logs\\transcript_full.jsonl';
const outPath = 'C:\\PitayaCode\\vision\\web\\src\\features\\chat\\pages\\CreativeChatLegacyPage.tsx';

let fileContent = '';

// Read transcript and parse line by line
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // Look for a tool response containing the file content of CreativeChatPage.tsx
    if (obj.tool_responses) {
      for (const res of obj.tool_responses) {
        if (res.name === 'default_api:view_file' && res.output && res.output.includes('CreativeChatPage.tsx')) {
          fileContent = res.output;
        }
      }
    }
  } catch (e) {}
}

if (fileContent) {
  // Extract just the file content between the line number markers or simply the raw code if possible.
  // The output format is usually:
  // "Showing lines X to Y\nThe following code has been modified... <line_number>: ...\n1: // ...\n2: ..."
  // Let's just try to parse the lines out.
  const codeLines = [];
  const linesArr = fileContent.split('\n');
  let started = false;
  for (const l of linesArr) {
    const match = l.match(/^\d+:\s(.*)$/);
    if (match) {
      codeLines.push(match[1]);
      started = true;
    } else if (started) {
       // if we hit something that doesn't match after we started, it might be the end message, but we should be careful.
       // actually, some lines might be empty or multi-line strings? Usually it's strictly \d+: 
    }
  }
  
  if (codeLines.length > 0) {
    // rename export function CreativeChatPage to CreativeChatLegacyPage
    let finalCode = codeLines.join('\n');
    finalCode = finalCode.replace(/export function CreativeChatPage/g, 'export function CreativeChatLegacyPage');
    fs.writeFileSync(outPath, finalCode, 'utf8');
    console.log('Legacy chat page extracted to ' + outPath);
  } else {
    console.log('Found view_file output but could not parse lines.');
  }
} else {
  console.log('Could not find CreativeChatPage.tsx in transcript.');
}
