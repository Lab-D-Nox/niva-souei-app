import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("Seeding dummy data...");

  // First, get the admin user (Niva)
  const [users] = await connection.execute(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  );
  
  let ownerUserId = 1;
  if (Array.isArray(users) && users.length > 0) {
    ownerUserId = users[0].id;
    console.log(`Found admin user with ID: ${ownerUserId}`);
  } else {
    console.log("No admin user found, using default ID 1");
  }

  // Insert AI Tools
  console.log("Inserting AI tools...");
  const toolsData = [
    { name: "Midjourney", description: "高品質な画像生成AI。アート性の高いビジュアル制作に最適。", url: "https://midjourney.com", category: "image" },
    { name: "Stable Diffusion", description: "オープンソースの画像生成AI。カスタマイズ性が高い。", url: "https://stability.ai", category: "image" },
    { name: "DALL-E 3", description: "OpenAIの画像生成AI。プロンプトの理解力が高い。", url: "https://openai.com/dall-e-3", category: "image" },
    { name: "Runway Gen-2", description: "テキストから動画を生成するAI。", url: "https://runwayml.com", category: "video" },
    { name: "Pika Labs", description: "動画生成・編集AI。", url: "https://pika.art", category: "video" },
    { name: "Suno AI", description: "AIによる音楽生成。歌詞から楽曲を作成。", url: "https://suno.ai", category: "audio" },
    { name: "Udio", description: "高品質な音楽生成AI。", url: "https://udio.com", category: "audio" },
    { name: "ElevenLabs", description: "高品質な音声合成・ボイスクローンAI。", url: "https://elevenlabs.io", category: "audio" },
    { name: "ChatGPT", description: "OpenAIの対話型AI。テキスト生成・編集に活用。", url: "https://chat.openai.com", category: "text" },
    { name: "Claude", description: "Anthropicの対話型AI。長文処理に強い。", url: "https://claude.ai", category: "text" },
  ];

  for (const tool of toolsData) {
    try {
      await connection.execute(
        "INSERT INTO tools (name, description, url, category) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)",
        [tool.name, tool.description, tool.url, tool.category]
      );
    } catch (e) {
      console.log(`Tool ${tool.name} might already exist, skipping...`);
    }
  }

  // Get tool IDs
  const [toolRows] = await connection.execute("SELECT id, name FROM tools");
  const toolMap = {};
  for (const row of toolRows) {
    toolMap[row.name] = row.id;
  }

  // Insert Tags
  console.log("Inserting tags...");
  const tagsData = [
    "風景", "ポートレート", "ファンタジー", "SF", "アニメ風", 
    "写実的", "抽象", "サイバーパンク", "自然", "都市",
    "音楽", "BGM", "ボーカル", "インストゥルメンタル", "エレクトロニック",
    "動画", "ショートフィルム", "MV", "プロモーション", "コンセプト"
  ];

  for (const tagName of tagsData) {
    try {
      await connection.execute(
        "INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
        [tagName]
      );
    } catch (e) {
      console.log(`Tag ${tagName} might already exist, skipping...`);
    }
  }

  // Get tag IDs
  const [tagRows] = await connection.execute("SELECT id, name FROM tags");
  const tagMap = {};
  for (const row of tagRows) {
    tagMap[row.name] = row.id;
  }

  // Insert Works
  console.log("Inserting works...");
  const worksData = [
    {
      type: "image",
      title: "幻想の森",
      description: "深い森の中に佇む神秘的な光景。朝霧が立ち込める中、木漏れ日が幻想的な雰囲気を演出しています。",
      thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
      mediaUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920",
      origin: "personal",
      promptText: "A mystical forest scene with morning mist, sunlight filtering through ancient trees, ethereal atmosphere, fantasy art style, 8k resolution",
      promptVisibility: "public",
      tools: ["Midjourney"],
      tags: ["風景", "ファンタジー", "自然"],
    },
    {
      type: "image",
      title: "ネオン都市",
      description: "サイバーパンクな未来都市の夜景。ネオンライトが雨に濡れた路地を照らす。",
      thumbnailUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800",
      mediaUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920",
      origin: "client",
      serviceTier: "standard",
      promptText: "Cyberpunk city at night, neon lights reflecting on wet streets, futuristic architecture, blade runner aesthetic",
      promptVisibility: "public",
      tools: ["Midjourney", "Stable Diffusion"],
      tags: ["都市", "サイバーパンク", "SF"],
    },
    {
      type: "image",
      title: "星空の下で",
      description: "満天の星空の下、静かに佇む一本の木。長時間露光で捉えた星の軌跡が美しい。",
      thumbnailUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800",
      mediaUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920",
      origin: "personal",
      promptText: "Starry night sky with a lone tree silhouette, milky way visible, long exposure star trails, astrophotography style",
      promptVisibility: "private",
      tools: ["DALL-E 3"],
      tags: ["風景", "自然", "写実的"],
    },
    {
      type: "image",
      title: "アニメ風ポートレート",
      description: "日本のアニメスタイルで描かれた少女のポートレート。繊細な表情と美しい色彩。",
      thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
      mediaUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920",
      origin: "client",
      serviceTier: "spot",
      promptVisibility: "private",
      tools: ["Stable Diffusion"],
      tags: ["ポートレート", "アニメ風"],
    },
    {
      type: "video",
      title: "夢の中の旅",
      description: "幻想的な世界を旅するショートフィルム。AIで生成された映像美。",
      thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
      mediaUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      origin: "personal",
      promptVisibility: "public",
      promptText: "Dreamy journey through surreal landscapes, floating islands, ethereal lighting, cinematic quality",
      tools: ["Runway Gen-2", "Midjourney"],
      tags: ["動画", "ファンタジー", "ショートフィルム"],
    },
    {
      type: "video",
      title: "プロダクトPV",
      description: "クライアント様向けに制作したプロダクト紹介動画。",
      thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
      mediaUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      origin: "client",
      serviceTier: "grand",
      promptVisibility: "private",
      tools: ["Runway Gen-2", "Pika Labs"],
      tags: ["動画", "プロモーション"],
    },
    {
      type: "audio",
      audioSubtype: "music",
      title: "Eternal Dawn",
      description: "夜明けをテーマにしたオリジナル楽曲。壮大なオーケストラサウンドとエレクトロニックの融合。",
      thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
      mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      origin: "personal",
      promptVisibility: "public",
      promptText: "Epic orchestral music with electronic elements, theme of dawn and new beginnings, cinematic quality",
      lyrics: "[Verse 1]\n夜明けの光が差し込む\n新しい一日が始まる\n\n[Chorus]\nEternal Dawn\n永遠の夜明け\n希望の光が照らす道",
      tools: ["Suno AI"],
      tags: ["音楽", "エレクトロニック", "インストゥルメンタル"],
    },
    {
      type: "audio",
      audioSubtype: "bgm",
      title: "Ambient Workspace",
      description: "作業用BGM。集中力を高める穏やかなアンビエントサウンド。",
      thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
      mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      origin: "client",
      serviceTier: "spot",
      promptVisibility: "private",
      tools: ["Udio"],
      tags: ["BGM", "インストゥルメンタル"],
    },
    {
      type: "text",
      title: "AIと創造性の未来",
      description: "AIがクリエイティブ産業に与える影響についての考察。",
      textContent: "# AIと創造性の未来\n\nAI技術の急速な発展により、クリエイティブ産業は大きな転換点を迎えています。\n\n## 1. ツールとしてのAI\n\nAIは創造性を置き換えるものではなく、拡張するツールです。アーティストの意図を形にする手段として、これまで技術的な制約で実現できなかった表現が可能になりました。\n\n## 2. 人間の役割\n\n最終的な判断、感情の込め方、ストーリーテリングは依然として人間の領域です。AIはあくまで道具であり、それをどう使うかは人間次第です。\n\n## 3. これからの展望\n\nAIとの協働により、より多くの人がクリエイティブな表現に参加できる時代が来ています。",
      origin: "personal",
      promptVisibility: "public",
      tools: ["ChatGPT", "Claude"],
      tags: ["コンセプト"],
    },
    {
      type: "web",
      title: "ポートフォリオサイト制作",
      description: "クリエイター向けポートフォリオサイトのデザイン・実装。",
      thumbnailUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800",
      externalUrl: "https://example.com",
      origin: "client",
      serviceTier: "grand",
      promptVisibility: "private",
      tools: ["ChatGPT"],
      tags: ["プロモーション"],
    },
  ];

  for (const work of worksData) {
    const { tools: workTools, tags: workTags, ...workData } = work;
    
    try {
      const [result] = await connection.execute(
        `INSERT INTO works (type, audioSubtype, title, description, thumbnailUrl, mediaUrl, externalUrl, textContent, origin, serviceTier, promptText, promptVisibility, lyrics, ownerUserId, likeCount, viewCount, commentCount) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workData.type,
          workData.audioSubtype || null,
          workData.title,
          workData.description || null,
          workData.thumbnailUrl || null,
          workData.mediaUrl || null,
          workData.externalUrl || null,
          workData.textContent || null,
          workData.origin || "personal",
          workData.serviceTier || null,
          workData.promptText || null,
          workData.promptVisibility || "private",
          workData.lyrics || null,
          ownerUserId,
          Math.floor(Math.random() * 100), // Random like count
          Math.floor(Math.random() * 500), // Random view count
          Math.floor(Math.random() * 20),  // Random comment count
        ]
      );

      const workId = result.insertId;
      console.log(`Inserted work: ${workData.title} (ID: ${workId})`);

      // Link tools
      if (workTools && workTools.length > 0) {
        for (const toolName of workTools) {
          const toolId = toolMap[toolName];
          if (toolId) {
            await connection.execute(
              "INSERT INTO work_tools (workId, toolId) VALUES (?, ?)",
              [workId, toolId]
            );
          }
        }
      }

      // Link tags
      if (workTags && workTags.length > 0) {
        for (const tagName of workTags) {
          const tagId = tagMap[tagName];
          if (tagId) {
            await connection.execute(
              "INSERT INTO work_tags (workId, tagId) VALUES (?, ?)",
              [workId, tagId]
            );
          }
        }
      }
    } catch (e) {
      console.error(`Error inserting work ${work.title}:`, e.message);
    }
  }

  console.log("Seeding completed!");
  await connection.end();
}

seed().catch(console.error);
