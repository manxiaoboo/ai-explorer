/**
 * Extended AI Tools Import - 400+ Tools
 * Includes international and Chinese AI tools
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extended tool database - 300+ additional tools
const EXTENDED_TOOLS = [
  // Additional Chat/LLM
  { name: 'Llama 2', website: 'https://llama.meta.com', category: 'Chat', tagline: 'Open source large language model by Meta', pricing: 'OPEN_SOURCE' },
  { name: 'Llama 3', website: 'https://llama.meta.com/llama3', category: 'Chat', tagline: 'Latest open source LLM by Meta', pricing: 'OPEN_SOURCE' },
  { name: 'Mistral AI', website: 'https://mistral.ai', category: 'Chat', tagline: 'European AI company with open source models', pricing: 'FREEMIUM' },
  { name: 'Cohere', website: 'https://cohere.com', category: 'Chat', tagline: 'Enterprise AI platform for NLP', pricing: 'PAID' },
  { name: 'AI21 Labs', website: 'https://studio.ai21.com', category: 'Chat', tagline: 'AI language models for enterprises', pricing: 'FREEMIUM' },
  { name: 'RWKV', website: 'https://rwkv.com', category: 'Chat', tagline: 'Open source RNN-based language model', pricing: 'OPEN_SOURCE' },
  { name: 'Grok', website: 'https://x.ai/grok', category: 'Chat', tagline: 'AI assistant by xAI', pricing: 'PAID' },
  { name: 'DeepSeek', website: 'https://deepseek.com', category: 'Chat', tagline: 'Chinese AI company with advanced LLMs', pricing: 'FREEMIUM' },
  { name: 'Qwen', website: 'https://qwenlm.github.io', category: 'Chat', tagline: 'Alibaba\'s large language model', pricing: 'OPEN_SOURCE' },
  { name: 'Baichuan', website: 'https://baichuan-ai.com', category: 'Chat', tagline: 'Chinese bilingual LLM', pricing: 'OPEN_SOURCE' },
  { name: 'ChatGLM', website: 'https://chatglm.cn', category: 'Chat', tagline: 'Chinese-English bilingual chatbot', pricing: 'FREEMIUM' },
  { name: 'MOSS', website: 'https://moss.fastnlp.top', category: 'Chat', tagline: 'Open source conversational AI', pricing: 'OPEN_SOURCE' },
  
  // Chinese Chat/Assistants
  { name: 'Doubao', website: 'https://doubao.com', category: 'Chat', tagline: 'ByteDance AI assistant with multimodal capabilities', pricing: 'FREEMIUM' },
  { name: 'Kimi AI', website: 'https://kimi.moonshot.cn', category: 'Chat', tagline: 'Chinese AI assistant with long context', pricing: 'FREEMIUM' },
  { name: 'Tongyi Qianwen', website: 'https://tongyi.aliyun.com', category: 'Chat', tagline: 'Alibaba Cloud AI assistant', pricing: 'FREEMIUM' },
  { name: 'Hunyuan', website: 'https://hunyuan.tencent.com', category: 'Chat', tagline: 'Tencent\'s foundation model', pricing: 'FREEMIUM' },
  { name: 'Wenxin Yiyan', website: 'https://yiyan.baidu.com', category: 'Chat', tagline: 'Baidu AI assistant', pricing: 'FREEMIUM' },
  { name: 'Xinghuo', website: 'https://xinghuo.xfyun.cn', category: 'Chat', tagline: 'iFlytek AI assistant', pricing: 'FREEMIUM' },
  { name: 'Zhihu Zhida', website: 'https://zhida.zhihu.com', category: 'Chat', tagline: 'Zhihu AI search assistant', pricing: 'FREE' },
  { name: 'Tiangong AI', website: 'https://tiangong.kunlun.com', category: 'Chat', tagline: 'Kunlun AI assistant', pricing: 'FREEMIUM' },
  
  // Additional Image Generation
  { name: 'Imagen 3', website: 'https://deepmind.google/technologies/imagen-3', category: 'Image', tagline: 'Google\'s text-to-image model', pricing: 'PAID' },
  { name: 'Fooocus', website: 'https://fooocus.com', category: 'Image', tagline: 'Free offline image generator', pricing: 'FREE' },
  { name: 'Invoke AI', website: 'https://invoke-ai.com', category: 'Image', tagline: 'Open source creative engine', pricing: 'OPEN_SOURCE' },
  { name: 'ComfyUI', website: 'https://comfyanonymous.github.io/ComfyUI', category: 'Image', tagline: 'Node-based Stable Diffusion GUI', pricing: 'OPEN_SOURCE' },
  { name: 'Automatic1111', website: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui', category: 'Image', tagline: 'Popular Stable Diffusion web UI', pricing: 'OPEN_SOURCE' },
  { name: 'Krita AI', website: 'https://krita.org/en/features/ai', category: 'Image', tagline: 'AI-powered digital painting', pricing: 'FREE' },
  { name: 'Draw Things', website: 'https://drawthings.ai', category: 'Image', tagline: 'AI image generation on Apple devices', pricing: 'FREEMIUM' },
  { name: 'DiffusionBee', website: 'https://diffusionbee.com', category: 'Image', tagline: 'Stable Diffusion for Mac', pricing: 'FREE' },
  { name: 'Mochi Diffusion', website: 'https://github.com/godly-devotion/MochiDiffusion', category: 'Image', tagline: 'Native Stable Diffusion for Mac', pricing: 'OPEN_SOURCE' },
  { name: 'SeaArt', website: 'https://seaart.ai', category: 'Image', tagline: 'AI art platform with models', pricing: 'FREEMIUM' },
  { name: 'Tensor.Art', website: 'https://tensor.art', category: 'Image', tagline: 'AI image generation platform', pricing: 'FREEMIUM' },
  { name: 'LiblibAI', website: 'https://liblib.art', category: 'Image', tagline: 'Chinese AI art community', pricing: 'FREEMIUM' },
  { name: 'Dreamina', website: 'https://dreamina.jianying.com', category: 'Image', tagline: 'ByteDance AI image and video', pricing: 'FREEMIUM' },
  { name: 'Jimeng', website: 'https://jimeng.jianying.com', category: 'Image', tagline: 'CapCut AI image generator', pricing: 'FREEMIUM' },
  { name: 'WHEE', website: 'https://whee.com', category: 'Image', tagline: 'Meitu AI art platform', pricing: 'FREEMIUM' },
  { name: '6pen Art', website: 'https://6pen.art', category: 'Image', tagline: 'Chinese AI art generator', pricing: 'FREEMIUM' },
  { name: 'Arting AI', website: 'https://arting.ai', category: 'Image', tagline: 'AI art generation platform', pricing: 'FREEMIUM' },
  
  // Additional Video
  { name: 'Luma Dream Machine', website: 'https://lumalabs.ai/dream-machine', category: 'Video', tagline: 'Fast video generation from text/images', pricing: 'FREEMIUM' },
  { name: 'Kling', website: 'https://klingai.com', category: 'Video', tagline: 'Kuaishou AI video generator', pricing: 'FREEMIUM' },
  { name: 'Hailuo AI', website: 'https://hailuoai.video', category: 'Video', tagline: 'MiniMax AI video generation', pricing: 'FREEMIUM' },
  { name: 'Vidu', website: 'https://vidu.studio', category: 'Video', tagline: 'Chinese AI video generation', pricing: 'FREEMIUM' },
  { name: 'CogVideo', website: 'https://github.com/THUDM/CogVideo', category: 'Video', tagline: 'Open source text-to-video model', pricing: 'OPEN_SOURCE' },
  { name: 'ModelScope', website: 'https://modelscope.cn', category: 'Video', tagline: 'Alibaba AI model platform', pricing: 'FREEMIUM' },
  { name: 'Wanxiang', website: 'https://wanxiang.aliyun.com', category: 'Video', tagline: 'Alibaba AI video generation', pricing: 'FREEMIUM' },
  { name: 'Morph Studio', website: 'https://morphstudio.com', category: 'Video', tagline: 'AI video creation platform', pricing: 'FREEMIUM' },
  { name: 'Genmo', website: 'https://genmo.ai', category: 'Video', tagline: 'AI video generation', pricing: 'FREEMIUM' },
  { name: 'Pika Labs', website: 'https://pika.art', category: 'Video', tagline: 'AI video creation', pricing: 'FREEMIUM' },
  { name: 'Stable Video', website: 'https://stablevideo.com', category: 'Video', tagline: 'Stability AI video generation', pricing: 'FREEMIUM' },
  { name: 'LensGo', website: 'https://lensgo.ai', category: 'Video', tagline: 'AI video and image generation', pricing: 'FREEMIUM' },
  
  // Additional Audio
  { name: 'Fish Audio', website: 'https://fish.audio', category: 'Audio', tagline: 'Open source TTS and voice cloning', pricing: 'OPEN_SOURCE' },
  { name: 'ChatTTS', website: 'https://chattts.com', category: 'Audio', tagline: 'Open source conversational TTS', pricing: 'OPEN_SOURCE' },
  { name: 'GPT-SoVITS', website: 'https://github.com/RVC-Boss/GPT-SoVITS', category: 'Audio', tagline: 'Voice conversion and cloning', pricing: 'OPEN_SOURCE' },
  { name: 'Bark', website: 'https://github.com/suno-ai/bark', category: 'Audio', tagline: 'Open source text-to-speech', pricing: 'OPEN_SOURCE' },
  { name: 'Tortoise TTS', website: 'https://github.com/neonbjb/tortoise-tts', category: 'Audio', tagline: 'High-quality TTS with voice cloning', pricing: 'OPEN_SOURCE' },
  { name: 'Coqui TTS', website: 'https://github.com/coqui-ai/TTS', category: 'Audio', tagline: 'Deep learning TTS toolkit', pricing: 'OPEN_SOURCE' },
  { name: 'Piper', website: 'https://github.com/rhasspy/piper', category: 'Audio', tagline: 'Fast local neural TTS', pricing: 'OPEN_SOURCE' },
  { name: 'StyleTTS 2', website: 'https://github.com/yl4579/StyleTTS2', category: 'Audio', tagline: 'Style-based TTS', pricing: 'OPEN_SOURCE' },
  { name: 'XTTS', website: 'https://github.com/coqui-ai/TTS', category: 'Audio', tagline: 'Cross-language voice cloning', pricing: 'OPEN_SOURCE' },
  { name: 'iFlytek', website: 'https://xinghuo.xfyun.cn', category: 'Audio', tagline: 'Chinese voice AI platform', pricing: 'FREEMIUM' },
  { name: 'Minimax Audio', website: 'https://minimax.chat', category: 'Audio', tagline: 'Chinese AI audio generation', pricing: 'FREEMIUM' },
  
  // Additional Code
  { name: 'Trae', website: 'https://trae.ai', category: 'Code', tagline: 'ByteDance AI IDE', pricing: 'FREE' },
  { name: 'Windsurf', website: 'https://codeium.com/windsurf', category: 'Code', tagline: 'AI-powered IDE by Codeium', pricing: 'FREEMIUM' },
  { name: 'Lovable', website: 'https://lovable.dev', category: 'Code', tagline: 'AI full-stack engineer', pricing: 'FREEMIUM' },
  { name: 'v0', website: 'https://v0.dev', category: 'Code', tagline: 'Vercel AI code generator', pricing: 'FREEMIUM' },
  { name: 'Bolt', website: 'https://bolt.new', category: 'Code', tagline: 'AI web development', pricing: 'FREEMIUM' },
  { name: 'Tempo', website: 'https://tempo.new', category: 'Code', tagline: 'AI React editor', pricing: 'FREEMIUM' },
  { name: 'Supermaven', website: 'https://supermaven.com', category: 'Code', tagline: 'AI coding assistant', pricing: 'FREEMIUM' },
  { name: 'Cody', website: 'https://sourcegraph.com/cody', category: 'Code', tagline: 'AI coding assistant', pricing: 'FREEMIUM' },
  { name: 'MarsCode', website: 'https://marscode.com', category: 'Code', tagline: 'ByteDance AI coding', pricing: 'FREE' },
  { name: 'CodeGeeX', website: 'https://codegeex.cn', category: 'Code', tagline: 'Tsinghua AI coding assistant', pricing: 'FREE' },
  { name: 'Comate', website: 'https://comate.baidu.com', category: 'Code', tagline: 'Baidu AI coding assistant', pricing: 'FREEMIUM' },
  { name: 'Tongyi Lingma', website: 'https://tongyi.aliyun.com/lingma', category: 'Code', tagline: 'Alibaba AI coding assistant', pricing: 'FREE' },
  { name: 'CodeBuddy', website: 'https://copilot.tencent.com', category: 'Code', tagline: 'Tencent AI coding assistant', pricing: 'FREE' },
  { name: 'iFlyCode', website: 'https://iflycode.xfyun.cn', category: 'Code', tagline: 'iFlytek AI coding assistant', pricing: 'FREEMIUM' },
  { name: 'Miaoda', website: 'https://miaoda.baidu.com', category: 'Code', tagline: 'Baidu no-code AI platform', pricing: 'FREE' },
  { name: 'Devv', website: 'https://devv.ai', category: 'Code', tagline: 'AI search for developers', pricing: 'FREEMIUM' },
  { name: 'Phind', website: 'https://phind.com', category: 'Code', tagline: 'AI search engine for developers', pricing: 'FREEMIUM' },
  { name: 'Blackbox', website: 'https://blackbox.ai', category: 'Code', tagline: 'AI coding assistant', pricing: 'FREEMIUM' },
  { name: 'Mutable', website: 'https://mutable.ai', category: 'Code', tagline: 'AI code completion', pricing: 'FREEMIUM' },
  { name: 'Figstack', website: 'https://figstack.com', category: 'Code', tagline: 'AI code explanation', pricing: 'FREEMIUM' },
  
  // Additional Writing
  { name: 'DeepL Write', website: 'https://deepl.com/write', category: 'Writing', tagline: 'AI writing assistant', pricing: 'FREEMIUM' },
  { name: 'HyperWrite', website: 'https://hyperwriteai.com', category: 'Writing', tagline: 'AI writing assistant', pricing: 'FREEMIUM' },
  { name: 'Lavender', website: 'https://lavender.ai', category: 'Writing', tagline: 'AI email assistant', pricing: 'PAID' },
  { name: 'Loom', website: 'https://loom.com', category: 'Writing', tagline: 'Video messaging with AI', pricing: 'FREEMIUM' },
  { name: 'Otter', website: 'https://otter.ai', category: 'Writing', tagline: 'AI meeting transcription', pricing: 'FREEMIUM' },
  { name: 'Fireflies', website: 'https://fireflies.ai', category: 'Writing', tagline: 'AI meeting assistant', pricing: 'FREEMIUM' },
  { name: 'Tactiq', website: 'https://tactiq.io', category: 'Writing', tagline: 'AI meeting notes', pricing: 'FREEMIUM' },
  { name: 'Read AI', website: 'https://read.ai', category: 'Writing', tagline: 'AI meeting summaries', pricing: 'FREEMIUM' },
  { name: 'Fathom', website: 'https://fathom.video', category: 'Writing', tagline: 'Free AI meeting recorder', pricing: 'FREE' },
  { name: 'Grain', website: 'https://grain.com', category: 'Writing', tagline: 'AI meeting recording', pricing: 'FREEMIUM' },
  { name: 'Chorus', website: 'https://chorus.ai', category: 'Writing', tagline: 'Conversation intelligence', pricing: 'PAID' },
  { name: 'Gong', website: 'https://gong.io', category: 'Writing', tagline: 'Revenue intelligence platform', pricing: 'PAID' },
  { name: 'CiCi', website: 'https://cici.com', category: 'Writing', tagline: 'ByteDance AI writing assistant', pricing: 'FREE' },
  { name: 'Orange Slice', website: 'https://chengpian.baidu.com', category: 'Writing', tagline: 'Baidu AI writing', pricing: 'FREE' },
  { name: 'Effidit', website: 'https://effidit.qq.com', category: 'Writing', tagline: 'Tencent AI writing', pricing: 'FREE' },
  
  // Design Tools
  { name: 'Galileo AI', website: 'https://galileo.ai', category: 'Design', tagline: 'AI UI generation', pricing: 'PAID' },
  { name: 'Framer AI', website: 'https://framer.com', category: 'Design', tagline: 'AI website builder', pricing: 'FREEMIUM' },
  { name: 'Webflow AI', website: 'https://webflow.com', category: 'Design', tagline: 'AI web design', pricing: 'PAID' },
  { name: 'Dora AI', website: 'https://dora.run', category: 'Design', tagline: 'AI 3D website builder', pricing: 'FREEMIUM' },
  { name: 'V0', website: 'https://v0.dev', category: 'Design', tagline: 'Vercel AI UI generator', pricing: 'FREEMIUM' },
  { name: 'Visily', website: 'https://visily.ai', category: 'Design', tagline: 'AI wireframing tool', pricing: 'FREEMIUM' },
  { name: 'MakeLogo AI', website: 'https://makelogo.ai', category: 'Design', tagline: 'AI logo generator', pricing: 'PAID' },
  { name: 'LogoAI', website: 'https://logoai.com', category: 'Design', tagline: 'AI logo maker', pricing: 'PAID' },
  { name: 'Brandmark', website: 'https://brandmark.io', category: 'Design', tagline: 'AI logo and branding', pricing: 'PAID' },
  { name: 'Namelix', website: 'https://namelix.com', category: 'Design', tagline: 'AI business name generator', pricing: 'FREE' },
  { name: 'Coolors', website: 'https://coolors.co', category: 'Design', tagline: 'AI color palette generator', pricing: 'FREEMIUM' },
  { name: 'Colormind', website: 'https://colormind.io', category: 'Design', tagline: 'AI color scheme generator', pricing: 'FREE' },
  { name: 'Fontjoy', website: 'https://fontjoy.com', category: 'Design', tagline: 'AI font pairing', pricing: 'FREE' },
  { name: 'MasterGo', website: 'https://mastergo.com', category: 'Design', tagline: 'Chinese collaborative design', pricing: 'FREEMIUM' },
  { name: 'Motiff', website: 'https://motiff.com', category: 'Design', tagline: 'AI UI design tool', pricing: 'FREEMIUM' },
  { name: 'Pixso', website: 'https://pixso.cn', category: 'Design', tagline: 'Chinese design platform', pricing: 'FREEMIUM' },
  { name: 'Jishi Design', website: 'https://js.design', category: 'Design', tagline: 'Chinese UI design tool', pricing: 'FREEMIUM' },
  { name: 'Modao', website: 'https://modao.cc', category: 'Design', tagline: 'Chinese prototyping tool', pricing: 'FREEMIUM' },
  { name: 'Chuangkit', website: 'https://chuangkit.com', category: 'Design', tagline: 'Chinese design platform', pricing: 'FREEMIUM' },
  { name: 'ARKIE', website: 'https://arkie.cn', category: 'Design', tagline: 'Chinese AI design', pricing: 'PAID' },
  
  // Productivity
  { name: 'Raycast', website: 'https://raycast.com', category: 'Productivity', tagline: 'AI-powered launcher', pricing: 'FREEMIUM' },
  { name: 'Alfred', website: 'https://alfredapp.com', category: 'Productivity', tagline: 'Mac productivity with AI', pricing: 'PAID' },
  { name: 'Linear', website: 'https://linear.app', category: 'Productivity', tagline: 'AI issue tracking', pricing: 'FREEMIUM' },
  { name: 'Height', website: 'https://height.app', category: 'Productivity', tagline: 'AI project management', pricing: 'PAID' },
  { name: 'ClickUp', website: 'https://clickup.com', category: 'Productivity', tagline: 'AI productivity platform', pricing: 'FREEMIUM' },
  { name: 'Asana AI', website: 'https://asana.com', category: 'Productivity', tagline: 'AI work management', pricing: 'FREEMIUM' },
  { name: 'Monday AI', website: 'https://monday.com', category: 'Productivity', tagline: 'AI work OS', pricing: 'PAID' },
  { name: 'Notion AI', website: 'https://notion.so', category: 'Productivity', tagline: 'AI workspace', pricing: 'FREEMIUM' },
  { name: 'Coda AI', website: 'https://coda.io', category: 'Productivity', tagline: 'AI document platform', pricing: 'PAID' },
  { name: 'Craft', website: 'https://craft.do', category: 'Productivity', tagline: 'AI document editor', pricing: 'FREEMIUM' },
  { name: 'Mem', website: 'https://mem.ai', category: 'Productivity', tagline: 'AI notes and search', pricing: 'FREEMIUM' },
  { name: 'Reflect', website: 'https://reflect.app', category: 'Productivity', tagline: 'AI note-taking', pricing: 'PAID' },
  { name: 'Tana', website: 'https://tana.inc', category: 'Productivity', tagline: 'AI knowledge base', pricing: 'PAID' },
  { name: 'Capacities', website: 'https://capacities.io', category: 'Productivity', tagline: 'AI-powered notes', pricing: 'FREEMIUM' },
  { name: 'Flowith', website: 'https://flowith.io', category: 'Productivity', tagline: 'Chinese AI workflow', pricing: 'FREEMIUM' },
  { name: 'Yingdao', website: 'https://yingdao.com', category: 'Productivity', tagline: 'Chinese RPA platform', pricing: 'PAID' },
  { name: 'Laiye', website: 'https://laiye.com', category: 'Productivity', tagline: 'Chinese automation', pricing: 'PAID' },
  
  // Research & Study
  { name: 'Perplexity', website: 'https://perplexity.ai', category: 'Research', tagline: 'AI search engine', pricing: 'FREEMIUM' },
  { name: 'You AI', website: 'https://you.com', category: 'Research', tagline: 'AI search', pricing: 'FREEMIUM' },
  { name: 'Neeva', website: 'https://neeva.com', category: 'Research', tagline: 'AI search engine', pricing: 'PAID' },
  { name: 'Kagi', website: 'https://kagi.com', category: 'Research', tagline: 'Premium AI search', pricing: 'PAID' },
  { name: 'Wolfram Alpha', website: 'https://wolframalpha.com', category: 'Research', tagline: 'Computational intelligence', pricing: 'FREEMIUM' },
  { name: 'Archive.org', website: 'https://archive.org', category: 'Research', tagline: 'Digital library', pricing: 'FREE' },
  { name: 'Zotero', website: 'https://zotero.org', category: 'Research', tagline: 'Research assistant', pricing: 'FREE' },
  { name: 'Mendeley', website: 'https://mendeley.com', category: 'Research', tagline: 'Reference manager', pricing: 'FREE' },
  { name: 'ReadCube', website: 'https://readcube.com', category: 'Research', tagline: 'Research paper manager', pricing: 'FREEMIUM' },
  { name: 'Citavi', website: 'https://citavi.com', category: 'Research', tagline: 'Reference management', pricing: 'PAID' },
  { name: 'Miro AI', website: 'https://miro.com', category: 'Research', tagline: 'AI whiteboard', pricing: 'FREEMIUM' },
  { name: 'Whimsical', website: 'https://whimsical.com', category: 'Research', tagline: 'AI mind mapping', pricing: 'FREEMIUM' },
  { name: 'Lucidchart', website: 'https://lucidchart.com', category: 'Research', tagline: 'AI diagramming', pricing: 'PAID' },
  { name: 'ProcessOn', website: 'https://processon.com', category: 'Research', tagline: 'Chinese diagram tool', pricing: 'FREEMIUM' },
  { name: 'Xmind AI', website: 'https://xmind.ai', category: 'Research', tagline: 'AI mind mapping', pricing: 'FREEMIUM' },
  { name: 'TreeMind', website: 'https://shutu.cn', category: 'Research', tagline: 'Chinese mind mapping', pricing: 'FREEMIUM' },
  { name: 'GitMind', website: 'https://gitmind.cn', category: 'Research', tagline: 'Chinese AI mind map', pricing: 'FREEMIUM' },
  
  // Marketing & SEO
  { name: 'Ahrefs AI', website: 'https://ahrefs.com', category: 'Marketing', tagline: 'AI SEO tools', pricing: 'PAID' },
  { name: 'Moz Pro', website: 'https://moz.com', category: 'Marketing', tagline: 'SEO platform', pricing: 'PAID' },
  { name: 'Majestic', website: 'https://majestic.com', category: 'Marketing', tagline: 'SEO backlink checker', pricing: 'PAID' },
  { name: 'Ubersuggest', website: 'https://neilpatel.com/ubersuggest', category: 'Marketing', tagline: 'SEO tool', pricing: 'FREEMIUM' },
  { name: 'AnswerThePublic', website: 'https://answerthepublic.com', category: 'Marketing', tagline: 'Search listening', pricing: 'FREEMIUM' },
  { name: 'BuzzSumo', website: 'https://buzzsumo.com', category: 'Marketing', tagline: 'Content research', pricing: 'PAID' },
  { name: 'SparkToro', website: 'https://sparktoro.com', category: 'Marketing', tagline: 'Audience research', pricing: 'PAID' },
  { name: 'Brand24', website: 'https://brand24.com', category: 'Marketing', tagline: 'Social listening', pricing: 'PAID' },
  { name: 'Mention', website: 'https://mention.com', category: 'Marketing', tagline: 'Brand monitoring', pricing: 'PAID' },
  { name: 'Buffer', website: 'https://buffer.com', category: 'Marketing', tagline: 'Social media management', pricing: 'FREEMIUM' },
  { name: 'Later', website: 'https://later.com', category: 'Marketing', tagline: 'Social scheduling', pricing: 'FREEMIUM' },
  { name: 'Hootsuite', website: 'https://hootsuite.com', category: 'Marketing', tagline: 'Social management', pricing: 'PAID' },
  { name: 'Sprout Social', website: 'https://sproutsocial.com', category: 'Marketing', tagline: 'Social media suite', pricing: 'PAID' },
  { name: 'Canva Social', website: 'https://canva.com', category: 'Marketing', tagline: 'Social media design', pricing: 'FREEMIUM' },
  { name: 'Loomly', website: 'https://loomly.com', category: 'Marketing', tagline: 'Social media calendar', pricing: 'PAID' },
  { name: 'Planable', website: 'https://planable.io', category: 'Marketing', tagline: 'Content collaboration', pricing: 'PAID' },
  { name: 'Xiaohongshu Creator', website: 'https://creator.xiaohongshu.com', category: 'Marketing', tagline: 'Chinese content platform', pricing: 'FREE' },
  { name: 'Xinbang', website: 'https://newrank.cn', category: 'Marketing', tagline: 'Chinese social analytics', pricing: 'PAID' },
  { name: 'Qianchuan', website: 'https://qianchuan.jinritemai.com', category: 'Marketing', tagline: 'Douyin marketing', pricing: 'PAID' },
  { name: 'Tencent Ads', website: 'https://e.qq.com', category: 'Marketing', tagline: 'Chinese ad platform', pricing: 'PAID' },
  
  // Data & Analytics
  { name: 'Snowflake', website: 'https://snowflake.com', category: 'Data', tagline: 'Cloud data platform', pricing: 'PAID' },
  { name: 'Databricks', website: 'https://databricks.com', category: 'Data', tagline: 'Data and AI platform', pricing: 'PAID' },
  { name: 'BigQuery', website: 'https://cloud.google.com/bigquery', category: 'Data', tagline: 'Google data warehouse', pricing: 'PAID' },
  { name: 'Redshift', website: 'https://aws.amazon.com/redshift', category: 'Data', tagline: 'AWS data warehouse', pricing: 'PAID' },
  { name: 'ClickHouse', website: 'https://clickhouse.com', category: 'Data', tagline: 'Fast analytics DB', pricing: 'OPEN_SOURCE' },
  { name: 'Supabase', website: 'https://supabase.com', category: 'Data', tagline: 'Open source Firebase', pricing: 'FREEMIUM' },
  { name: 'PlanetScale', website: 'https://planetscale.com', category: 'Data', tagline: 'MySQL platform', pricing: 'FREEMIUM' },
  { name: 'Neon', website: 'https://neon.tech', category: 'Data', tagline: 'Serverless Postgres', pricing: 'FREEMIUM' },
  { name: 'CockroachDB', website: 'https://cockroachlabs.com', category: 'Data', tagline: 'Distributed SQL', pricing: 'FREEMIUM' },
  { name: 'MongoDB Atlas', website: 'https://mongodb.com', category: 'Data', tagline: 'Cloud database', pricing: 'FREEMIUM' },
  { name: 'InfluxDB', website: 'https://influxdata.com', category: 'Data', tagline: 'Time series DB', pricing: 'OPEN_SOURCE' },
  { name: 'TimescaleDB', website: 'https://timescale.com', category: 'Data', tagline: 'Time-series SQL', pricing: 'OPEN_SOURCE' },
  { name: 'QuestDB', website: 'https://questdb.io', category: 'Data', tagline: 'Fast SQL analytics', pricing: 'OPEN_SOURCE' },
  { name: 'DuckDB', website: 'https://duckdb.org', category: 'Data', tagline: 'In-process analytics', pricing: 'OPEN_SOURCE' },
  { name: 'MotherDuck', website: 'https://motherduck.com', category: 'Data', tagline: 'DuckDB cloud', pricing: 'FREEMIUM' },
  { name: 'TiDB', website: 'https://pingcap.com', category: 'Data', tagline: 'Distributed SQL database', pricing: 'OPEN_SOURCE' },
  { name: 'OceanBase', website: 'https://oceanbase.com', category: 'Data', tagline: 'Alibaba distributed DB', pricing: 'OPEN_SOURCE' },
  { name: 'PolarDB', website: 'https://aliyun.com/product/polardb', category: 'Data', tagline: 'Alibaba cloud DB', pricing: 'PAID' },
  { name: 'AnalyticDB', website: 'https://aliyun.com/product/analyticdb', category: 'Data', tagline: 'Alibaba analytics DB', pricing: 'PAID' },
  { name: 'MaxCompute', website: 'https://aliyun.com/product/odps', category: 'Data', tagline: 'Alibaba big data', pricing: 'PAID' },
  
  // Education & Learning
  { name: 'Khan Academy', website: 'https://khanacademy.org', category: 'Education', tagline: 'Free education platform', pricing: 'FREE' },
  { name: 'Coursera', website: 'https://coursera.org', category: 'Education', tagline: 'Online courses', pricing: 'FREEMIUM' },
  { name: 'Udemy', website: 'https://udemy.com', category: 'Education', tagline: 'Online learning', pricing: 'PAID' },
  { name: 'edX', website: 'https://edx.org', category: 'Education', tagline: 'University courses', pricing: 'FREEMIUM' },
  { name: 'Duolingo', website: 'https://duolingo.com', category: 'Education', tagline: 'Language learning', pricing: 'FREEMIUM' },
  { name: 'Quizlet', website: 'https://quizlet.com', category: 'Education', tagline: 'Study tools', pricing: 'FREEMIUM' },
  { name: 'Chegg', website: 'https://chegg.com', category: 'Education', tagline: 'Student help', pricing: 'PAID' },
  { name: 'Brilliant', website: 'https://brilliant.org', category: 'Education', tagline: 'Interactive learning', pricing: 'PAID' },
  { name: 'DataCamp', website: 'https://datacamp.com', category: 'Education', tagline: 'Data science learning', pricing: 'PAID' },
  { name: 'Codecademy', website: 'https://codecademy.com', category: 'Education', tagline: 'Coding courses', pricing: 'FREEMIUM' },
  { name: 'LeetCode', website: 'https://leetcode.com', category: 'Education', tagline: 'Coding practice', pricing: 'FREEMIUM' },
  { name: 'HackerRank', website: 'https://hackerrank.com', category: 'Education', tagline: 'Coding challenges', pricing: 'FREEMIUM' },
  { name: 'freeCodeCamp', website: 'https://freecodecamp.org', category: 'Education', tagline: 'Free coding bootcamp', pricing: 'FREE' },
  { name: 'The Odin Project', website: 'https://theodinproject.com', category: 'Education', tagline: 'Free web dev course', pricing: 'FREE' },
  { name: 'XuetangX', website: 'https://xuetangx.com', category: 'Education', tagline: 'Chinese MOOC platform', pricing: 'FREE' },
  { name: 'CNMOOC', website: 'https://cnmooc.org', category: 'Education', tagline: 'Chinese online courses', pricing: 'FREE' },
  { name: 'iCourse', website: 'https://icourse163.org', category: 'Education', tagline: 'Chinese university courses', pricing: 'FREE' },
  { name: 'Chaoxing', website: 'https://chaoxing.com', category: 'Education', tagline: 'Chinese learning platform', pricing: 'FREE' },
  { name: 'Zhihuishu', website: 'https://zhihuishu.com', category: 'Education', tagline: 'Chinese education', pricing: 'FREE' },
  { name: 'Xueersi', website: 'https://xueersi.com', category: 'Education', tagline: 'TAL online education', pricing: 'PAID' },
  
  // Browser & Extensions
  { name: 'Arc Browser', website: 'https://arc.net', category: 'Productivity', tagline: 'AI browser', pricing: 'FREE' },
  { name: 'SigmaOS', website: 'https://sigmaos.com', category: 'Productivity', tagline: 'AI browser for work', pricing: 'FREEMIUM' },
  { name: 'Brave Browser', website: 'https://brave.com', category: 'Productivity', tagline: 'Privacy browser with AI', pricing: 'FREE' },
  { name: 'Opera One', website: 'https://opera.com', category: 'Productivity', tagline: 'AI browser', pricing: 'FREE' },
  { name: 'Edge Copilot', website: 'https://microsoft.com/edge', category: 'Productivity', tagline: 'AI in Edge browser', pricing: 'FREE' },
  { name: 'Monica', website: 'https://monica.im', category: 'Productivity', tagline: 'AI assistant extension', pricing: 'FREEMIUM' },
  { name: 'Merlin', website: 'https://merlin.foyer.work', category: 'Productivity', tagline: 'AI extension for Chrome', pricing: 'FREEMIUM' },
  { name: 'MaxAI', website: 'https://maxai.me', category: 'Productivity', tagline: 'AI browser assistant', pricing: 'FREEMIUM' },
  { name: 'ChatGPT Sidebar', website: 'https://chatgpt-sidebar.com', category: 'Productivity', tagline: 'ChatGPT in sidebar', pricing: 'FREEMIUM' },
  { name: 'Sider', website: 'https://sider.ai', category: 'Productivity', tagline: 'AI sidebar assistant', pricing: 'FREEMIUM' },
  { name: 'Lingvanex', website: 'https://lingvanex.com', category: 'Productivity', tagline: 'AI translation', pricing: 'FREEMIUM' },
  { name: 'Immersive Translate', website: 'https://immersivetranslate.com', category: 'Productivity', tagline: 'Bilingual translation', pricing: 'FREE' },
  { name: '360 AI Browser', website: 'https://browser.360.cn/ai', category: 'Productivity', tagline: 'Chinese AI browser', pricing: 'FREE' },
  { name: 'QQ Browser AI', website: 'https://browser.qq.com', category: 'Productivity', tagline: 'Tencent AI browser', pricing: 'FREE' },
  
  // 3D & Modeling
  { name: 'Blender', website: 'https://blender.org', category: 'Design', tagline: '3D creation suite', pricing: 'FREE' },
  { name: 'Spline', website: 'https://spline.design', category: 'Design', tagline: '3D design tool', pricing: 'FREEMIUM' },
  { name: 'Shapr3D', website: 'https://shapr3d.com', category: 'Design', tagline: '3D CAD modeling', pricing: 'PAID' },
  { name: 'Nomad Sculpt', website: 'https://nomadsculpt.com', category: 'Design', tagline: '3D sculpting', pricing: 'PAID' },
  { name: 'Meshy', website: 'https://meshy.ai', category: 'Design', tagline: 'AI 3D model generator', pricing: 'FREEMIUM' },
  { name: 'Rodin', website: 'https://rodin.io', category: 'Design', tagline: 'AI 3D generation', pricing: 'PAID' },
  { name: 'CSM', website: 'https://csm.ai', category: 'Design', tagline: '3D world models', pricing: 'PAID' },
  { name: 'Luma AI', website: 'https://lumalabs.ai', category: 'Design', tagline: 'NeRF and 3D capture', pricing: 'FREEMIUM' },
  { name: 'Polycam', website: 'https://polycam.ai', category: 'Design', tagline: '3D scanning', pricing: 'FREEMIUM' },
  { name: 'RealityScan', website: 'https://epicgames.com', category: 'Design', tagline: '3D scanning app', pricing: 'FREE' },
  { name: 'Kaedim', website: 'https://kaedim3d.com', category: 'Design', tagline: '2D to 3D conversion', pricing: 'PAID' },
  { name: 'Tripo AI', website: 'https://trio3d.ai', category: 'Design', tagline: 'Chinese AI 3D generation', pricing: 'FREEMIUM' },
  { name: 'VAST', website: 'https://vast.ai', category: 'Design', tagline: 'Chinese 3D AI platform', pricing: 'FREEMIUM' },
  
  // Gaming
  { name: 'NVIDIA DLSS', website: 'https://nvidia.com/dlss', category: 'Other', tagline: 'AI upscaling for games', pricing: 'FREE' },
  { name: 'AMD FSR', website: 'https://amd.com/fsr', category: 'Other', tagline: 'AI upscaling', pricing: 'FREE' },
  { name: 'Intel XeSS', website: 'https://intel.com/xess', category: 'Other', tagline: 'AI upscaling', pricing: 'FREE' },
  { name: 'AI Dungeon', website: 'https://aidungeon.io', category: 'Other', tagline: 'AI text adventure', pricing: 'FREEMIUM' },
  { name: 'NovelAI', website: 'https://novelai.net', category: 'Other', tagline: 'AI story writing', pricing: 'PAID' },
  { name: 'Scenario', website: 'https://scenario.com', category: 'Other', tagline: 'AI game assets', pricing: 'PAID' },
  { name: 'Rosebud AI', website: 'https://rosebud.ai', category: 'Other', tagline: 'AI game dev', pricing: 'FREEMIUM' },
  { name: 'Inworld AI', website: 'https://inworld.ai', category: 'Other', tagline: 'AI NPCs', pricing: 'PAID' },
  { name: 'Charisma', website: 'https://charisma.ai', category: 'Other', tagline: 'AI characters', pricing: 'PAID' },
  { name: 'Convai', website: 'https://convai.com', category: 'Other', tagline: 'AI NPC platform', pricing: 'PAID' },
  
  // Finance
  { name: 'Robinhood', website: 'https://robinhood.com', category: 'Other', tagline: 'Trading app', pricing: 'FREE' },
  { name: 'Wealthfront', website: 'https://wealthfront.com', category: 'Other', tagline: 'Robo-advisor', pricing: 'PAID' },
  { name: 'Betterment', website: 'https://betterment.com', category: 'Other', tagline: 'AI investing', pricing: 'PAID' },
  { name: 'Mint', website: 'https://mint.intuit.com', category: 'Other', tagline: 'Budget tracker', pricing: 'FREE' },
  { name: 'YNAB', website: 'https://ynab.com', category: 'Other', tagline: 'Budget app', pricing: 'PAID' },
  { name: 'Personal Capital', website: 'https://empower.com', category: 'Other', tagline: 'Wealth management', pricing: 'FREE' },
  { name: 'Kavout', website: 'https://kavout.com', category: 'Other', tagline: 'AI stock analysis', pricing: 'PAID' },
  { name: 'Tickeron', website: 'https://tickeron.com', category: 'Other', tagline: 'AI trading', pricing: 'PAID' },
  { name: 'Trade Ideas', website: 'https://trade-ideas.com', category: 'Other', tagline: 'AI stock scanner', pricing: 'PAID' },
  { name: 'Ant Fortune', website: 'https://antfortune.com', category: 'Other', tagline: 'Alibaba wealth app', pricing: 'FREE' },
  { name: 'Wealth Management', website: 'https://wealthmanagement.jd.com', category: 'Other', tagline: 'JD Finance', pricing: 'FREE' },
  { name: 'Lufax', website: 'https://lufax.com', category: 'Other', tagline: 'Chinese fintech', pricing: 'FREE' },
  
  // Health & Fitness
  { name: 'MyFitnessPal', website: 'https://myfitnesspal.com', category: 'Other', tagline: 'Calorie counter', pricing: 'FREEMIUM' },
  { name: 'Strava', website: 'https://strava.com', category: 'Other', tagline: 'Fitness tracking', pricing: 'FREEMIUM' },
  { name: 'Nike Run Club', website: 'https://nike.com/nrc', category: 'Other', tagline: 'Running app', pricing: 'FREE' },
  { name: 'Peloton', website: 'https://onepeloton.com', category: 'Other', tagline: 'Fitness platform', pricing: 'PAID' },
  { name: 'Fitbit', website: 'https://fitbit.com', category: 'Other', tagline: 'Health tracking', pricing: 'PAID' },
  { name: 'Calm', website: 'https://calm.com', category: 'Other', tagline: 'Meditation app', pricing: 'FREEMIUM' },
  { name: 'Headspace', website: 'https://headspace.com', category: 'Other', tagline: 'Meditation', pricing: 'FREEMIUM' },
  { name: 'Ada Health', website: 'https://ada.com', category: 'Other', tagline: 'AI symptom checker', pricing: 'FREE' },
  { name: 'Babylon Health', website: 'https://babylonhealth.com', category: 'Other', tagline: 'AI healthcare', pricing: 'PAID' },
  { name: 'K Health', website: 'https://khealth.com', category: 'Other', tagline: 'AI health chat', pricing: 'FREEMIUM' },
  { name: 'Ping An Good Doctor', website: 'https://haodf.com', category: 'Other', tagline: 'Chinese health app', pricing: 'FREE' },
  { name: 'Chunyu Doctor', website: 'https://chunyuyisheng.com', category: 'Other', tagline: 'Chinese health platform', pricing: 'FREE' },
  
  // Legal
  { name: 'LegalZoom', website: 'https://legalzoom.com', category: 'Other', tagline: 'Legal services', pricing: 'PAID' },
  { name: 'Rocket Lawyer', website: 'https://rocketlawyer.com', category: 'Other', tagline: 'Legal documents', pricing: 'PAID' },
  { name: 'DoNotPay', website: 'https://donotpay.com', category: 'Other', tagline: 'AI legal assistant', pricing: 'PAID' },
  { name: 'Harvey AI', website: 'https://harvey.ai', category: 'Other', tagline: 'AI for law firms', pricing: 'PAID' },
  { name: 'CoCounsel', website: 'https://casetext.com', category: 'Other', tagline: 'AI legal research', pricing: 'PAID' },
  { name: 'LexisNexis+', website: 'https://lexisnexis.com', category: 'Other', tagline: 'Legal research', pricing: 'PAID' },
  { name: 'Westlaw Edge', website: 'https://westlaw.com', category: 'Other', tagline: 'AI legal research', pricing: 'PAID' },
  { name: 'Ironclad', website: 'https://ironcladapp.com', category: 'Other', tagline: 'Contract management', pricing: 'PAID' },
  { name: 'LinkSquares', website: 'https://linksquares.com', category: 'Other', tagline: 'Contract analytics', pricing: 'PAID' },
  { name: 'Evisort', website: 'https://evisort.com', category: 'Other', tagline: 'AI contract management', pricing: 'PAID' },
  
  // Customer Support
  { name: 'Zendesk', website: 'https://zendesk.com', category: 'Other', tagline: 'Customer service', pricing: 'PAID' },
  { name: 'Intercom', website: 'https://intercom.com', category: 'Other', tagline: 'Customer messaging', pricing: 'PAID' },
  { name: 'Freshdesk', website: 'https://freshdesk.com', category: 'Other', tagline: 'Help desk software', pricing: 'FREEMIUM' },
  { name: 'Help Scout', website: 'https://helpscout.com', category: 'Other', tagline: 'Customer support', pricing: 'PAID' },
  { name: 'Crisp', website: 'https://crisp.chat', category: 'Other', tagline: 'Customer messaging', pricing: 'FREEMIUM' },
  { name: 'Tidio', website: 'https://tidio.com', category: 'Other', tagline: 'Live chat', pricing: 'FREEMIUM' },
  { name: 'LiveChat', website: 'https://livechat.com', category: 'Other', tagline: 'Customer chat', pricing: 'PAID' },
  { name: 'Drift', website: 'https://drift.com', category: 'Other', tagline: 'Conversational marketing', pricing: 'PAID' },
  { name: 'Kustomer', website: 'https://kustomer.com', category: 'Other', tagline: 'Customer service CRM', pricing: 'PAID' },
  { name: 'Gorgias', website: 'https://gorgias.com', category: 'Other', tagline: 'Ecommerce helpdesk', pricing: 'PAID' },
  
  // E-commerce
  { name: 'Shopify', website: 'https://shopify.com', category: 'Other', tagline: 'Ecommerce platform', pricing: 'PAID' },
  { name: 'WooCommerce', website: 'https://woocommerce.com', category: 'Other', tagline: 'WordPress ecommerce', pricing: 'FREE' },
  { name: 'BigCommerce', website: 'https://bigcommerce.com', category: 'Other', tagline: 'Ecommerce platform', pricing: 'PAID' },
  { name: 'Magento', website: 'https://magento.com', category: 'Other', tagline: 'Ecommerce platform', pricing: 'FREE' },
  { name: 'Squarespace', website: 'https://squarespace.com', category: 'Other', tagline: 'Website builder', pricing: 'PAID' },
  { name: 'Wix', website: 'https://wix.com', category: 'Other', tagline: 'Website builder', pricing: 'FREEMIUM' },
  { name: 'Ecwid', website: 'https://ecwid.com', category: 'Other', tagline: 'Ecommerce widget', pricing: 'FREEMIUM' },
  { name: 'PrestaShop', website: 'https://prestashop.com', category: 'Other', tagline: 'Open source ecommerce', pricing: 'FREE' },
  { name: 'OpenCart', website: 'https://opencart.com', category: 'Other', tagline: 'Ecommerce platform', pricing: 'FREE' },
  { name: 'Taobao Seller', website: 'https://sell.taobao.com', category: 'Other', tagline: 'Alibaba ecommerce', pricing: 'FREE' },
  { name: 'JD Seller', website: 'https://shop.jd.com', category: 'Other', tagline: 'JD ecommerce', pricing: 'FREE' },
  { name: 'Pinduoduo Merchant', website: 'https://mms.pinduoduo.com', category: 'Other', tagline: 'PDD ecommerce', pricing: 'FREE' },
  
  // HR & Recruiting
  { name: 'LinkedIn', website: 'https://linkedin.com', category: 'Other', tagline: 'Professional network', pricing: 'FREEMIUM' },
  { name: 'Indeed', website: 'https://indeed.com', category: 'Other', tagline: 'Job search', pricing: 'FREE' },
  { name: 'Glassdoor', website: 'https://glassdoor.com', category: 'Other', tagline: 'Company reviews', pricing: 'FREE' },
  { name: 'Lever', website: 'https://lever.co', category: 'Other', tagline: 'ATS and recruiting', pricing: 'PAID' },
  { name: 'Greenhouse', website: 'https://greenhouse.io', category: 'Other', tagline: 'Recruiting software', pricing: 'PAID' },
  { name: 'Workday', website: 'https://workday.com', category: 'Other', tagline: 'HR management', pricing: 'PAID' },
  { name: 'BambooHR', website: 'https://bamboohr.com', category: 'Other', tagline: 'HR software', pricing: 'PAID' },
  { name: 'Gusto', website: 'https://gusto.com', category: 'Other', tagline: 'HR and payroll', pricing: 'PAID' },
  { name: 'Deel', website: 'https://deel.com', category: 'Other', tagline: 'Global payroll', pricing: 'PAID' },
  { name: 'Remote', website: 'https://remote.com', category: 'Other', tagline: 'Global employment', pricing: 'PAID' },
  { name: 'Boss Zhipin', website: 'https://zhipin.com', category: 'Other', tagline: 'Chinese recruiting', pricing: 'FREE' },
  { name: '51job', website: 'https://51job.com', category: 'Other', tagline: 'Chinese job board', pricing: 'FREE' },
  
  // Security
  { name: '1Password', website: 'https://1password.com', category: 'Other', tagline: 'Password manager', pricing: 'PAID' },
  { name: 'Bitwarden', website: 'https://bitwarden.com', category: 'Other', tagline: 'Open source password manager', pricing: 'FREEMIUM' },
  { name: 'LastPass', website: 'https://lastpass.com', category: 'Other', tagline: 'Password manager', pricing: 'FREEMIUM' },
  { name: 'Dashlane', website: 'https://dashlane.com', category: 'Other', tagline: 'Password manager', pricing: 'FREEMIUM' },
  { name: 'NordPass', website: 'https://nordpass.com', category: 'Other', tagline: 'Password manager', pricing: 'FREEMIUM' },
  { name: 'Proton Pass', website: 'https://proton.me/pass', category: 'Other', tagline: 'Encrypted password manager', pricing: 'FREEMIUM' },
  { name: 'Keeper', website: 'https://keepersecurity.com', category: 'Other', tagline: 'Password manager', pricing: 'PAID' },
  { name: 'RoboForm', website: 'https://roboform.com', category: 'Other', tagline: 'Password manager', pricing: 'FREEMIUM' },
  { name: 'Norton', website: 'https://norton.com', category: 'Other', tagline: 'Security suite', pricing: 'PAID' },
  { name: 'McAfee', website: 'https://mcafee.com', category: 'Other', tagline: 'Antivirus software', pricing: 'PAID' },
  { name: 'Kaspersky', website: 'https://kaspersky.com', category: 'Other', tagline: 'Cybersecurity', pricing: 'PAID' },
  { name: 'Avast', website: 'https://avast.com', category: 'Other', tagline: 'Antivirus', pricing: 'FREEMIUM' },
  
  // Cloud Storage
  { name: 'Dropbox', website: 'https://dropbox.com', category: 'Other', tagline: 'Cloud storage', pricing: 'FREEMIUM' },
  { name: 'Google Drive', website: 'https://drive.google.com', category: 'Other', tagline: 'Cloud storage', pricing: 'FREEMIUM' },
  { name: 'OneDrive', website: 'https://onedrive.live.com', category: 'Other', tagline: 'Microsoft cloud storage', pricing: 'FREEMIUM' },
  { name: 'iCloud', website: 'https://icloud.com', category: 'Other', tagline: 'Apple cloud storage', pricing: 'FREEMIUM' },
  { name: 'Box', website: 'https://box.com', category: 'Other', tagline: 'Enterprise cloud storage', pricing: 'PAID' },
  { name: 'pCloud', website: 'https://pcloud.com', category: 'Other', tagline: 'Secure cloud storage', pricing: 'PAID' },
  { name: 'Sync', website: 'https://sync.com', category: 'Other', tagline: 'Private cloud storage', pricing: 'FREEMIUM' },
  { name: 'MEGA', website: 'https://mega.nz', category: 'Other', tagline: 'Encrypted cloud storage', pricing: 'FREEMIUM' },
  { name: 'Nextcloud', website: 'https://nextcloud.com', category: 'Other', tagline: 'Self-hosted cloud', pricing: 'FREE' },
  { name: 'ownCloud', website: 'https://owncloud.com', category: 'Other', tagline: 'File sync and share', pricing: 'FREE' },
  { name: 'Baidu Netdisk', website: 'https://pan.baidu.com', category: 'Other', tagline: 'Chinese cloud storage', pricing: 'FREEMIUM' },
  { name: 'Weiyun', website: 'https://weiyun.com', category: 'Other', tagline: 'Tencent cloud storage', pricing: 'FREEMIUM' },
  
  // Communication
  { name: 'Slack', website: 'https://slack.com', category: 'Other', tagline: 'Team messaging', pricing: 'FREEMIUM' },
  { name: 'Microsoft Teams', website: 'https://teams.microsoft.com', category: 'Other', tagline: 'Team collaboration', pricing: 'FREEMIUM' },
  { name: 'Discord', website: 'https://discord.com', category: 'Other', tagline: 'Community platform', pricing: 'FREE' },
  { name: 'Zoom', website: 'https://zoom.us', category: 'Other', tagline: 'Video conferencing', pricing: 'FREEMIUM' },
  { name: 'Google Meet', website: 'https://meet.google.com', category: 'Other', tagline: 'Video meetings', pricing: 'FREE' },
  { name: 'Webex', website: 'https://webex.com', category: 'Other', tagline: 'Video conferencing', pricing: 'FREEMIUM' },
  { name: 'GoToMeeting', website: 'https://gotomeeting.com', category: 'Other', tagline: 'Online meetings', pricing: 'PAID' },
  { name: 'BlueJeans', website: 'https://bluejeans.com', category: 'Other', tagline: 'Video meetings', pricing: 'PAID' },
  { name: 'Whereby', website: 'https://whereby.com', category: 'Other', tagline: 'Video meetings', pricing: 'FREEMIUM' },
  { name: 'Jitsi', website: 'https://jitsi.org', category: 'Other', tagline: 'Open source video', pricing: 'FREE' },
  { name: 'WeChat Work', website: 'https://work.weixin.qq.com', category: 'Other', tagline: 'Tencent business chat', pricing: 'FREE' },
  { name: 'DingTalk', website: 'https://dingtalk.com', category: 'Other', tagline: 'Alibaba team chat', pricing: 'FREE' },
  { name: 'Feishu', website: 'https://feishu.cn', category: 'Other', tagline: 'ByteDance team platform', pricing: 'FREEMIUM' },
  
  // Email
  { name: 'Gmail', website: 'https://gmail.com', category: 'Other', tagline: 'Email service', pricing: 'FREE' },
  { name: 'Outlook', website: 'https://outlook.com', category: 'Other', tagline: 'Microsoft email', pricing: 'FREE' },
  { name: 'Proton Mail', website: 'https://proton.me/mail', category: 'Other', tagline: 'Encrypted email', pricing: 'FREEMIUM' },
  { name: 'Tutanota', website: 'https://tutanota.com', category: 'Other', tagline: 'Secure email', pricing: 'FREEMIUM' },
  { name: 'Fastmail', website: 'https://fastmail.com', category: 'Other', tagline: 'Private email', pricing: 'PAID' },
  { name: 'Hey', website: 'https://hey.com', category: 'Other', tagline: 'Reimagined email', pricing: 'PAID' },
  { name: 'Superhuman', website: 'https://superhuman.com', category: 'Other', tagline: 'Fast email client', pricing: 'PAID' },
  { name: 'Spark', website: 'https://sparkmailapp.com', category: 'Other', tagline: 'Smart email app', pricing: 'FREEMIUM' },
  { name: 'Newton Mail', website: 'https://newtonmail.com', category: 'Other', tagline: 'Email supercharger', pricing: 'PAID' },
  { name: 'Airmail', website: 'https://airmailapp.com', category: 'Other', tagline: 'Email client', pricing: 'PAID' },
  { name: 'Foxmail', website: 'https://foxmail.com', category: 'Other', tagline: 'Tencent email client', pricing: 'FREE' },
  { name: 'NetEase Mail', website: 'https://mail.163.com', category: 'Other', tagline: 'Chinese email service', pricing: 'FREE' },
  
  // News & Content
  { name: 'Feedly', website: 'https://feedly.com', category: 'Other', tagline: 'RSS reader', pricing: 'FREEMIUM' },
  { name: 'Inoreader', website: 'https://inoreader.com', category: 'Other', tagline: 'Content reader', pricing: 'FREEMIUM' },
  { name: 'Pocket', website: 'https://getpocket.com', category: 'Other', tagline: 'Save for later', pricing: 'FREEMIUM' },
  { name: 'Instapaper', website: 'https://instapaper.com', category: 'Other', tagline: 'Read later', pricing: 'FREEMIUM' },
  { name: 'Flipboard', website: 'https://flipboard.com', category: 'Other', tagline: 'News aggregator', pricing: 'FREE' },
  { name: 'Apple News', website: 'https://apple.com/news', category: 'Other', tagline: 'News app', pricing: 'FREE' },
  { name: 'Google News', website: 'https://news.google.com', category: 'Other', tagline: 'News aggregator', pricing: 'FREE' },
  { name: 'Reddit', website: 'https://reddit.com', category: 'Other', tagline: 'Community forum', pricing: 'FREE' },
  { name: 'Hacker News', website: 'https://news.ycombinator.com', category: 'Other', tagline: 'Tech news', pricing: 'FREE' },
  { name: 'Product Hunt', website: 'https://producthunt.com', category: 'Other', tagline: 'Product discovery', pricing: 'FREE' },
  { name: 'Toutiao', website: 'https://toutiao.com', category: 'Other', tagline: 'ByteDance news app', pricing: 'FREE' },
  { name: 'Tencent News', website: 'https://news.qq.com', category: 'Other', tagline: 'Chinese news portal', pricing: 'FREE' },
  
  // Music
  { name: 'Spotify', website: 'https://spotify.com', category: 'Other', tagline: 'Music streaming', pricing: 'FREEMIUM' },
  { name: 'Apple Music', website: 'https://music.apple.com', category: 'Other', tagline: 'Music streaming', pricing: 'PAID' },
  { name: 'YouTube Music', website: 'https://music.youtube.com', category: 'Other', tagline: 'Music streaming', pricing: 'FREEMIUM' },
  { name: 'Amazon Music', website: 'https://music.amazon.com', category: 'Other', tagline: 'Music streaming', pricing: 'PAID' },
  { name: 'Tidal', website: 'https://tidal.com', category: 'Other', tagline: 'Hi-fi music', pricing: 'PAID' },
  { name: 'Deezer', website: 'https://deezer.com', category: 'Other', tagline: 'Music streaming', pricing: 'FREEMIUM' },
  { name: 'SoundCloud', website: 'https://soundcloud.com', category: 'Other', tagline: 'Audio platform', pricing: 'FREEMIUM' },
  { name: 'Bandcamp', website: 'https://bandcamp.com', category: 'Other', tagline: 'Music store', pricing: 'FREE' },
  { name: 'Pandora', website: 'https://pandora.com', category: 'Other', tagline: 'Music streaming', pricing: 'FREEMIUM' },
  { name: 'iHeartRadio', website: 'https://iheart.com', category: 'Other', tagline: 'Radio streaming', pricing: 'FREEMIUM' },
  { name: 'QQ Music', website: 'https://y.qq.com', category: 'Other', tagline: 'Tencent music app', pricing: 'FREEMIUM' },
  { name: 'NetEase Cloud Music', website: 'https://music.163.com', category: 'Other', tagline: 'Chinese music streaming', pricing: 'FREEMIUM' },
  
  // Video Streaming
  { name: 'Netflix', website: 'https://netflix.com', category: 'Other', tagline: 'Video streaming', pricing: 'PAID' },
  { name: 'YouTube', website: 'https://youtube.com', category: 'Other', tagline: 'Video platform', pricing: 'FREE' },
  { name: 'Disney+', website: 'https://disneyplus.com', category: 'Other', tagline: 'Disney streaming', pricing: 'PAID' },
  { name: 'Hulu', website: 'https://hulu.com', category: 'Other', tagline: 'TV streaming', pricing: 'PAID' },
  { name: 'HBO Max', website: 'https://max.com', category: 'Other', tagline: 'HBO streaming', pricing: 'PAID' },
  { name: 'Amazon Prime Video', website: 'https://primevideo.com', category: 'Other', tagline: 'Video streaming', pricing: 'PAID' },
  { name: 'Apple TV+', website: 'https://tv.apple.com', category: 'Other', tagline: 'Apple streaming', pricing: 'PAID' },
  { name: 'Peacock', website: 'https://peacocktv.com', category: 'Other', tagline: 'NBC streaming', pricing: 'FREEMIUM' },
  { name: 'Paramount+', website: 'https://paramountplus.com', category: 'Other', tagline: 'Paramount streaming', pricing: 'PAID' },
  { name: 'Twitch', website: 'https://twitch.tv', category: 'Other', tagline: 'Live streaming', pricing: 'FREE' },
  { name: 'iQiyi', website: 'https://iqiyi.com', category: 'Other', tagline: 'Chinese video platform', pricing: 'PAID' },
  { name: 'Youku', website: 'https://youku.com', category: 'Other', tagline: 'Alibaba video platform', pricing: 'PAID' },
  { name: 'Bilibili', website: 'https://bilibili.com', category: 'Other', tagline: 'Chinese video community', pricing: 'FREE' },
  
  // Travel
  { name: 'Booking.com', website: 'https://booking.com', category: 'Other', tagline: 'Hotel booking', pricing: 'FREE' },
  { name: 'Airbnb', website: 'https://airbnb.com', category: 'Other', tagline: 'Vacation rentals', pricing: 'FREE' },
  { name: 'Expedia', website: 'https://expedia.com', category: 'Other', tagline: 'Travel booking', pricing: 'FREE' },
  { name: 'Trip.com', website: 'https://trip.com', category: 'Other', tagline: 'Travel platform', pricing: 'FREE' },
  { name: 'Skyscanner', website: 'https://skyscanner.com', category: 'Other', tagline: 'Flight search', pricing: 'FREE' },
  { name: 'Kayak', website: 'https://kayak.com', category: 'Other', tagline: 'Travel search', pricing: 'FREE' },
  { name: 'Google Flights', website: 'https://flights.google.com', category: 'Other', tagline: 'Flight search', pricing: 'FREE' },
  { name: 'Hopper', website: 'https://hopper.com', category: 'Other', tagline: 'Travel prediction', pricing: 'FREE' },
  { name: 'TripIt', website: 'https://tripit.com', category: 'Other', tagline: 'Travel organizer', pricing: 'FREEMIUM' },
  { name: 'Roadtrippers', website: 'https://roadtrippers.com', category: 'Other', tagline: 'Trip planner', pricing: 'FREEMIUM' },
  { name: 'Ctrip', website: 'https://ctrip.com', category: 'Other', tagline: 'Chinese travel booking', pricing: 'FREE' },
  { name: 'Fliggy', website: 'https://fliggy.com', category: 'Other', tagline: 'Alibaba travel', pricing: 'FREE' },
  
  // Food & Delivery
  { name: 'DoorDash', website: 'https://doordash.com', category: 'Other', tagline: 'Food delivery', pricing: 'FREE' },
  { name: 'Uber Eats', website: 'https://ubereats.com', category: 'Other', tagline: 'Food delivery', pricing: 'FREE' },
  { name: 'Grubhub', website: 'https://grubhub.com', category: 'Other', tagline: 'Food delivery', pricing: 'FREE' },
  { name: 'Instacart', website: 'https://instacart.com', category: 'Other', tagline: 'Grocery delivery', pricing: 'FREE' },
  { name: 'Postmates', website: 'https://postmates.com', category: 'Other', tagline: 'Delivery service', pricing: 'FREE' },
  { name: 'Gopuff', website: 'https://gopuff.com', category: 'Other', tagline: 'Quick delivery', pricing: 'FREE' },
  { name: 'Meituan', website: 'https://meituan.com', category: 'Other', tagline: 'Chinese food delivery', pricing: 'FREE' },
  { name: 'Ele.me', website: 'https://ele.me', category: 'Other', tagline: 'Alibaba food delivery', pricing: 'FREE' },
  { name: 'Dianping', website: 'https://dianping.com', category: 'Other', tagline: 'Chinese restaurant reviews', pricing: 'FREE' },
  { name: 'Hema', website: 'https://hema.taobao.com', category: 'Other', tagline: 'Alibaba fresh grocery', pricing: 'FREE' },
  
  // Shopping
  { name: 'Amazon', website: 'https://amazon.com', category: 'Other', tagline: 'Online shopping', pricing: 'FREE' },
  { name: 'eBay', website: 'https://ebay.com', category: 'Other', tagline: 'Online marketplace', pricing: 'FREE' },
  { name: 'Walmart', website: 'https://walmart.com', category: 'Other', tagline: 'Retail shopping', pricing: 'FREE' },
  { name: 'Target', website: 'https://target.com', category: 'Other', tagline: 'Retail shopping', pricing: 'FREE' },
  { name: 'Best Buy', website: 'https://bestbuy.com', category: 'Other', tagline: 'Electronics retailer', pricing: 'FREE' },
  { name: 'Etsy', website: 'https://etsy.com', category: 'Other', tagline: 'Handmade marketplace', pricing: 'FREE' },
  { name: 'AliExpress', website: 'https://aliexpress.com', category: 'Other', tagline: 'Global marketplace', pricing: 'FREE' },
  { name: 'Taobao', website: 'https://taobao.com', category: 'Other', tagline: 'Chinese marketplace', pricing: 'FREE' },
  { name: 'Tmall', website: 'https://tmall.com', category: 'Other', tagline: 'Alibaba B2C platform', pricing: 'FREE' },
  { name: 'JD.com', website: 'https://jd.com', category: 'Other', tagline: 'Chinese ecommerce', pricing: 'FREE' },
  { name: 'Pinduoduo', website: 'https://pinduoduo.com', category: 'Other', tagline: 'Chinese group buying', pricing: 'FREE' },
  { name: 'Suning', website: 'https://suning.com', category: 'Other', tagline: 'Chinese retail', pricing: 'FREE' },
  
  // Real Estate
  { name: 'Zillow', website: 'https://zillow.com', category: 'Other', tagline: 'Real estate marketplace', pricing: 'FREE' },
  { name: 'Realtor.com', website: 'https://realtor.com', category: 'Other', tagline: 'Home search', pricing: 'FREE' },
  { name: 'Redfin', website: 'https://redfin.com', category: 'Other', tagline: 'Real estate brokerage', pricing: 'FREE' },
  { name: 'Trulia', website: 'https://trulia.com', category: 'Other', tagline: 'Home search', pricing: 'FREE' },
  { name: 'Apartments.com', website: 'https://apartments.com', category: 'Other', tagline: 'Rental search', pricing: 'FREE' },
  { name: 'Zumper', website: 'https://zumper.com', category: 'Other', tagline: 'Apartment finder', pricing: 'FREE' },
  { name: 'PadMapper', website: 'https://padmapper.com', category: 'Other', tagline: 'Apartment search', pricing: 'FREE' },
  { name: 'Lianjia', website: 'https://lianjia.com', category: 'Other', tagline: 'Chinese real estate', pricing: 'FREE' },
  { name: 'Anjuke', website: 'https://anjuke.com', category: 'Other', tagline: 'Chinese property portal', pricing: 'FREE' },
  { name: 'Fang.com', website: 'https://fang.com', category: 'Other', tagline: 'Chinese real estate', pricing: 'FREE' },
  
  // Weather
  { name: 'Weather.com', website: 'https://weather.com', category: 'Other', tagline: 'Weather forecast', pricing: 'FREE' },
  { name: 'AccuWeather', website: 'https://accuweather.com', category: 'Other', tagline: 'Weather service', pricing: 'FREE' },
  { name: 'Weather Underground', website: 'https://wunderground.com', category: 'Other', tagline: 'Weather data', pricing: 'FREE' },
  { name: 'Dark Sky', website: 'https://darksky.net', category: 'Other', tagline: 'Hyperlocal weather', pricing: 'PAID' },
  { name: 'Carrot Weather', website: 'https://meadow.io', category: 'Other', tagline: 'Weather app', pricing: 'PAID' },
  { name: 'Windy', website: 'https://windy.com', category: 'Other', tagline: 'Weather visualization', pricing: 'FREE' },
  { name: 'Ventusky', website: 'https://ventusky.com', category: 'Other', tagline: 'Weather maps', pricing: 'FREE' },
  { name: 'Moji Weather', website: 'https://moji.com', category: 'Other', tagline: 'Chinese weather app', pricing: 'FREE' },
  
  // Maps & Navigation
  { name: 'Google Maps', website: 'https://maps.google.com', category: 'Other', tagline: 'Mapping service', pricing: 'FREE' },
  { name: 'Apple Maps', website: 'https://maps.apple.com', category: 'Other', tagline: 'Apple mapping', pricing: 'FREE' },
  { name: 'Waze', website: 'https://waze.com', category: 'Other', tagline: 'Crowdsourced navigation', pricing: 'FREE' },
  { name: 'Mapbox', website: 'https://mapbox.com', category: 'Other', tagline: 'Custom maps', pricing: 'FREEMIUM' },
  { name: 'HERE WeGo', website: 'https://wego.here.com', category: 'Other', tagline: 'Navigation app', pricing: 'FREE' },
  { name: 'TomTom', website: 'https://tomtom.com', category: 'Other', tagline: 'Navigation and maps', pricing: 'FREEMIUM' },
  { name: 'Sygic', website: 'https://sygic.com', category: 'Other', tagline: 'GPS navigation', pricing: 'FREEMIUM' },
  { name: 'Gaode Map', website: 'https://amap.com', category: 'Other', tagline: 'Alibaba maps', pricing: 'FREE' },
  { name: 'Baidu Map', website: 'https://map.baidu.com', category: 'Other', tagline: 'Baidu navigation', pricing: 'FREE' },
  
  // Translation
  { name: 'Google Translate', website: 'https://translate.google.com', category: 'Other', tagline: 'Translation service', pricing: 'FREE' },
  { name: 'DeepL', website: 'https://deepl.com', category: 'Other', tagline: 'AI translation', pricing: 'FREEMIUM' },
  { name: 'Microsoft Translator', website: 'https://translator.microsoft.com', category: 'Other', tagline: 'Translation service', pricing: 'FREE' },
  { name: 'Yandex Translate', website: 'https://translate.yandex.com', category: 'Other', tagline: 'Translation service', pricing: 'FREE' },
  { name: 'Papago', website: 'https://papago.naver.com', category: 'Other', tagline: 'Naver translation', pricing: 'FREE' },
  { name: 'Reverso', website: 'https://reverso.net', category: 'Other', tagline: 'Translation and grammar', pricing: 'FREEMIUM' },
  { name: 'Linguee', website: 'https://linguee.com', category: 'Other', tagline: 'Dictionary and translation', pricing: 'FREE' },
  { name: 'Baidu Translate', website: 'https://fanyi.baidu.com', category: 'Other', tagline: 'Baidu translation', pricing: 'FREE' },
  { name: 'Youdao Translate', website: 'https://fanyi.youdao.com', category: 'Other', tagline: 'NetEase translation', pricing: 'FREE' },
  { name: 'Tencent Translator', website: 'https://fanyi.qq.com', category: 'Other', tagline: 'Tencent translation', pricing: 'FREE' },
  
  // Dating
  { name: 'Tinder', website: 'https://tinder.com', category: 'Other', tagline: 'Dating app', pricing: 'FREEMIUM' },
  { name: 'Bumble', website: 'https://bumble.com', category: 'Other', tagline: 'Dating app', pricing: 'FREEMIUM' },
  { name: 'Hinge', website: 'https://hinge.co', category: 'Other', tagline: 'Dating app', pricing: 'FREEMIUM' },
  { name: 'OkCupid', website: 'https://okcupid.com', category: 'Other', tagline: 'Dating platform', pricing: 'FREEMIUM' },
  { name: 'Match', website: 'https://match.com', category: 'Other', tagline: 'Dating service', pricing: 'PAID' },
  { name: 'eHarmony', website: 'https://eharmony.com', category: 'Other', tagline: 'Dating for relationships', pricing: 'PAID' },
  { name: 'Coffee Meets Bagel', website: 'https://coffeemeetsbagel.com', category: 'Other', tagline: 'Dating app', pricing: 'FREEMIUM' },
  { name: 'Plenty of Fish', website: 'https://pof.com', category: 'Other', tagline: 'Dating platform', pricing: 'FREEMIUM' },
  { name: 'Momo', website: 'https://immomo.com', category: 'Other', tagline: 'Chinese social app', pricing: 'FREE' },
  { name: 'Tantan', website: 'https://tantanapp.com', category: 'Other', tagline: 'Chinese dating app', pricing: 'FREEMIUM' },
  { name: 'Soul', website: 'https://soulapp.cn', category: 'Other', tagline: 'Chinese social platform', pricing: 'FREE' },
  
  // Fitness
  { name: 'Nike Training Club', website: 'https://nike.com/ntc', category: 'Other', tagline: 'Workout app', pricing: 'FREE' },
  { name: 'Adidas Training', website: 'https://adidas.com/training', category: 'Other', tagline: 'Fitness app', pricing: 'FREE' },
  { name: 'Freeletics', website: 'https://freeletics.com', category: 'Other', tagline: 'Bodyweight training', pricing: 'FREEMIUM' },
  { name: 'JEFIT', website: 'https://jefit.com', category: 'Other', tagline: 'Workout tracker', pricing: 'FREEMIUM' },
  { name: 'Strong', website: 'https://strong.app', category: 'Other', tagline: 'Workout log', pricing: 'FREEMIUM' },
  { name: 'Hevy', website: 'https://hevy.com', category: 'Other', tagline: 'Workout tracker', pricing: 'FREEMIUM' },
  { name: 'Fitbod', website: 'https://fitbod.me', category: 'Other', tagline: 'AI workout planner', pricing: 'PAID' },
  { name: 'WHOOP', website: 'https://whoop.com', category: 'Other', tagline: 'Fitness tracker', pricing: 'PAID' },
  { name: 'Oura', website: 'https://ouraring.com', category: 'Other', tagline: 'Smart ring', pricing: 'PAID' },
  { name: 'Keep', website: 'https://gotokeep.com', category: 'Other', tagline: 'Chinese fitness app', pricing: 'FREE' },
  { name: 'Yodo Run', website: 'https://yodorun.com', category: 'Other', tagline: 'Chinese running app', pricing: 'FREE' },
  
  // Sports
  { name: 'ESPN', website: 'https://espn.com', category: 'Other', tagline: 'Sports news', pricing: 'FREE' },
  { name: 'Bleacher Report', website: 'https://bleacherreport.com', category: 'Other', tagline: 'Sports news', pricing: 'FREE' },
  { name: 'The Athletic', website: 'https://theathletic.com', category: 'Other', tagline: 'Sports journalism', pricing: 'PAID' },
  { name: 'SofaScore', website: 'https://sofascore.com', category: 'Other', tagline: 'Live scores', pricing: 'FREE' },
  { name: 'FlashScore', website: 'https://flashscore.com', category: 'Other', tagline: 'Live scores', pricing: 'FREE' },
  { name: '365Scores', website: 'https://365scores.com', category: 'Other', tagline: 'Sports scores', pricing: 'FREE' },
  { name: 'FotMob', website: 'https://fotmob.com', category: 'Other', tagline: 'Football scores', pricing: 'FREE' },
  { name: 'OneFootball', website: 'https://onefootball.com', category: 'Other', tagline: 'Football news', pricing: 'FREE' },
  { name: 'NBA App', website: 'https://nba.com/app', category: 'Other', tagline: 'NBA official app', pricing: 'FREE' },
  { name: 'NFL App', website: 'https://nfl.com/app', category: 'Other', tagline: 'NFL official app', pricing: 'FREE' },
  { name: 'Hupu', website: 'https://hupu.com', category: 'Other', tagline: 'Chinese sports forum', pricing: 'FREE' },
  { name: 'Dongqiudi', website: 'https://dongqiudi.com', category: 'Other', tagline: 'Chinese football app', pricing: 'FREE' },
];

interface ToolData {
  name: string;
  website: string;
  category: string;
  tagline: string;
  pricing: 'FREE' | 'FREEMIUM' | 'PAID' | 'OPEN_SOURCE' | 'ENTERPRISE';
}

async function findOrCreateCategory(name: string) {
  let category = await prisma.category.findFirst({ where: { name } });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description: `${name} AI tools`,
      }
    });
    console.log(`Created category: ${name}`);
  }
  
  return category;
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase();
}

async function saveTool(toolData: ToolData) {
  try {
    const normalizedUrl = normalizeUrl(toolData.website);
    const slug = generateSlug(toolData.name);
    
    // Check for duplicates
    const existing = await prisma.tool.findFirst({
      where: {
        OR: [
          { website: { contains: normalizedUrl } },
          { slug },
          { name: { equals: toolData.name, mode: 'insensitive' } }
        ]
      }
    });
    
    if (existing) {
      console.log(`Skipping duplicate: ${toolData.name}`);
      return { action: 'skipped', name: toolData.name };
    }
    
    const category = await findOrCreateCategory(toolData.category);
    
    await prisma.tool.create({
      data: {
        slug,
        name: toolData.name,
        tagline: toolData.tagline,
        description: toolData.tagline,
        website: toolData.website,
        categoryId: category.id,
        pricingTier: toolData.pricing,
        isActive: true,
        trendingScore: 50,
      }
    });
    
    console.log(`Created: ${toolData.name}`);
    return { action: 'created', name: toolData.name };
    
  } catch (error) {
    console.error(`Error saving ${toolData.name}:`, error);
    return { action: 'error', name: toolData.name };
  }
}

async function main() {
  console.log('========================================');
  console.log(`Extended AI Tools Import - ${EXTENDED_TOOLS.length} tools`);
  console.log('========================================\n');
  
  const results = { created: 0, skipped: 0, errors: 0 };
  
  for (const tool of EXTENDED_TOOLS) {
    const result = await saveTool(tool);
    
    if (result.action === 'created') results.created++;
    else if (result.action === 'skipped') results.skipped++;
    else results.errors++;
    
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  const totalTools = await prisma.tool.count({ where: { isActive: true } });
  
  console.log('\n========================================');
  console.log('Import Summary');
  console.log('========================================');
  console.log(`Total in batch: ${EXTENDED_TOOLS.length}`);
  console.log(`Created: ${results.created}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Total in database: ${totalTools}`);
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

main().catch(console.error);
