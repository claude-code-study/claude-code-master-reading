const fs = require('fs');
const path = require('path');

const members = require('../members.config');
const schedule = require('../schedule.config');
const readmePath = path.join(__dirname, '..', 'README.md');

let readme = fs.readFileSync(readmePath, 'utf8');

// 구성원 테이블 업데이트
const tableRows = members
  .map(m => `| <img src="https://github.com/${m.githubId}.png" width="30" /> | [@${m.githubId}](https://github.com/${m.githubId}) |`)
  .join('\n');
const tableContent = `| 사진 | 멤버 |\n|--|--|\n${tableRows}`;

readme = readme.replace(
  /<!-- MEMBERS_TABLE_START -->[\s\S]*?<!-- MEMBERS_TABLE_END -->/,
  `<!-- MEMBERS_TABLE_START -->\n${tableContent}\n<!-- MEMBERS_TABLE_END -->`
);

// 레포 구조 업데이트
const dirLines = members
  .map(m => `📁 ${m.dir}/   — ${m.githubId}의 챕터별 학습 노트`)
  .join('\n');
const dirsContent = `\`\`\`\n${dirLines}\n\`\`\``;

readme = readme.replace(
  /<!-- MEMBERS_DIRS_START -->[\s\S]*?<!-- MEMBERS_DIRS_END -->/,
  `<!-- MEMBERS_DIRS_START -->\n${dirsContent}\n<!-- MEMBERS_DIRS_END -->`
);

// 스터디 일정 테이블 업데이트
const scheduleRows = schedule
  .map(s => `| ${s.date} | ${s.part} | ${s.title} | ${s.done ? '✅' : ''} |`)
  .join('\n');
const scheduleContent = `| 일정 | 챕터 | 제목 | 진행 |\n|--|--|--| -- |\n${scheduleRows}`;

readme = readme.replace(
  /<!-- SCHEDULE_TABLE_START -->[\s\S]*?<!-- SCHEDULE_TABLE_END -->/,
  `<!-- SCHEDULE_TABLE_START -->\n${scheduleContent}\n<!-- SCHEDULE_TABLE_END -->`
);

fs.writeFileSync(readmePath, readme);
console.log('✅ README.md 업데이트 완료');
