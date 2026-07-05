const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(fullPath, content, 'utf8');
}

// src/components/layout/CommandBar.tsx
replaceInFile('src/components/layout/CommandBar.tsx', /import clsx from 'clsx';\n/, '');

// src/components/ui/index.tsx
replaceInFile('src/components/ui/index.tsx', /Loader2, /, '');

// src/features/analytics/pages/AnalyticsStudioPage.tsx
replaceInFile('src/features/analytics/pages/AnalyticsStudioPage.tsx', /SectionHeader /, '');

// src/features/audience/pages/AudienceStudioPage.tsx
replaceInFile('src/features/audience/pages/AudienceStudioPage.tsx', /EmptyState, /, '');
replaceInFile('src/features/audience/pages/AudienceStudioPage.tsx', /StatusBadge, /, '');
replaceInFile('src/features/audience/pages/AudienceStudioPage.tsx', /ScoreBar /, '');

// src/features/brand/pages/BrandStudioPage.tsx
replaceInFile('src/features/brand/pages/BrandStudioPage.tsx', /X, /, '');
replaceInFile('src/features/brand/pages/BrandStudioPage.tsx', /import clsx from 'clsx';\n/, '');

// src/features/campaigns/pages/CampaignStudioPage.tsx
replaceInFile('src/features/campaigns/pages/CampaignStudioPage.tsx', /Clock, /, '');
replaceInFile('src/features/campaigns/pages/CampaignStudioPage.tsx', /Loader2, /, '');

// src/features/characters/pages/CharactersPage.tsx
replaceInFile('src/features/characters/pages/CharactersPage.tsx', /Users, /, '');
replaceInFile('src/features/characters/pages/CharactersPage.tsx', /Activity, /, '');
replaceInFile('src/features/characters/pages/CharactersPage.tsx', /TabBar, /, '');

// src/features/chat/components/AgentPipeline.tsx
replaceInFile('src/features/chat/components/AgentPipeline.tsx', /Circle, /, '');
replaceInFile('src/features/chat/components/AgentPipeline.tsx', /from '\.\.\/\.\.\/\.\.\/\.\.\/types'/, "from '../../../types'");

// src/features/chat/components/ChatMessageBubble.tsx
replaceInFile('src/features/chat/components/ChatMessageBubble.tsx', /import \{ GlassPanel \} from '\.\.\/\.\.\/\.\.\/components\/ui';\n/, '');

// src/features/chat/pages/CreativeChatPage.tsx
replaceInFile('src/features/chat/pages/CreativeChatPage.tsx', /MessageSquare, /, '');
replaceInFile('src/features/chat/pages/CreativeChatPage.tsx', /Plus, /, '');
replaceInFile('src/features/chat/pages/CreativeChatPage.tsx', /Maximize2 /, '');
replaceInFile('src/features/chat/pages/CreativeChatPage.tsx', /import \{ PageHeader, GlassPanel \} from '\.\.\/\.\.\/\.\.\/components\/ui';\n/, '');

// src/features/content/pages/ContentStudioPage.tsx
replaceInFile('src/features/content/pages/ContentStudioPage.tsx', /Users, /, '');
replaceInFile('src/features/content/pages/ContentStudioPage.tsx', /Eye /, '');
replaceInFile('src/features/content/pages/ContentStudioPage.tsx', /EmptyState, /, '');

// src/features/dashboard/pages/DashboardPage.tsx
replaceInFile('src/features/dashboard/pages/DashboardPage.tsx', /Zap, /, '');
replaceInFile('src/features/dashboard/pages/DashboardPage.tsx', /Eye, /, '');

// src/features/library/pages/LibraryPage.tsx
replaceInFile('src/features/library/pages/LibraryPage.tsx', /FileTemplate/g, 'LayoutTemplate');
replaceInFile('src/features/library/pages/LibraryPage.tsx', /AssetType, /, '');
replaceInFile('src/features/library/pages/LibraryPage.tsx', /import clsx from 'clsx';\n/, '');

// src/features/publisher/pages/PublisherStudioPage.tsx
replaceInFile('src/features/publisher/pages/PublisherStudioPage.tsx', /AlertCircle, /, '');
replaceInFile('src/features/publisher/pages/PublisherStudioPage.tsx', /EmptyState, /, '');
replaceInFile('src/features/publisher/pages/PublisherStudioPage.tsx', /LoadingSpinner /, '');
replaceInFile('src/features/publisher/pages/PublisherStudioPage.tsx', /Plus, RefreshCw/, 'Plus, Sparkles, RefreshCw'); // Adding Sparkles

// src/lib/api.ts
replaceInFile('src/lib/api.ts', /Brand, /, '');
replaceInFile('src/lib/api.ts', /Campaign, /, '');
replaceInFile('src/lib/api.ts', /ContentPiece, /, '');
replaceInFile('src/lib/api.ts', /SocialPost, /, '');
replaceInFile('src/lib/api.ts', /Character, /, '');
replaceInFile('src/lib/api.ts', /Asset, /, '');
replaceInFile('src/lib/api.ts', /AppNotification /, '');
replaceInFile('src/lib/api.ts', /import type {[\s\S]*?} from '\.\/types';/, ''); // Or just let type imports be unused if not an error, wait it was an error. 
replaceInFile('src/lib/api.ts', /import \{[\s\S]*?\} from '\.\/types';/, (match) => {
  return match.replace(/Brand, /, '').replace(/Campaign, /, '').replace(/ContentPiece, /, '').replace(/SocialPost, /, '').replace(/Character, /, '').replace(/Asset, /, '').replace(/AppNotification /, '');
});

// src/types/index.ts
let typesContent = fs.readFileSync(path.join(__dirname, 'src/types/index.ts'), 'utf8');
if (!typesContent.includes('export interface AssetPreview')) {
  typesContent = typesContent.replace('export interface Campaign {', 'export interface AssetPreview {\n  id: string;\n  url: string;\n  type: string;\n}\n\nexport interface Campaign {');
  fs.writeFileSync(path.join(__dirname, 'src/types/index.ts'), typesContent, 'utf8');
}

console.log('Done fixing imports.');
