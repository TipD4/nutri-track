// ============================================================================
// NutriTrack: AI Food Recognition Proxy (ZhipuAI GLM-4V-Plus)
// ============================================================================
// Deploy: supabase functions deploy proxy-ai
// Set secret: supabase secrets set ZHIPUAI_API_KEY=xxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ============================================================================
// Types
// ============================================================================

interface AIFoodResult {
  name: string
  estimated_weight_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  confidence: number
}

interface RequestBody {
  imagePath: string
  mealType?: string
}

// ============================================================================
// Prompt Engineering — Professional Food Recognition
// ============================================================================

const MEAL_TYPE_HINTS: Record<string, string> = {
  breakfast: "这是一顿**早餐**。常见中式早餐：包子、馒头、油条、豆浆、粥、鸡蛋饼、煎饼果子。西式早餐：面包、吐司、牛奶、麦片、煎蛋、培根。",
  lunch: "这是一顿**午餐**。通常包含主食+1-3个菜。常见搭配：米饭/面条 + 炒菜/烧菜 + 汤。中式快餐：盖浇饭、麻辣烫、米线、炒饭。西式：三明治、沙拉、意面。",
  dinner: "这是一顿**晚餐**。与午餐结构类似，可能更丰盛。注意：如果是火锅、烧烤、自助餐，可能会有多种食材。",
  snack: "这是一份**加餐/零食**。常见：水果（香蕉、苹果、橙子）、坚果、酸奶、能量棒、饼干、面包、牛奶。",
}

// Comprehensive nutrition database (per 100g unless noted)
const NUTRITION_DB = `
### 主食类 (per 100g 熟重)
| 食物 | 热量 | 蛋白质 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 白米饭 | 116 | 2.6 | 0.3 | 25.9 |
| 糙米饭 | 123 | 2.7 | 0.9 | 23.5 |
| 馒头 | 223 | 7.0 | 1.1 | 44.2 |
| 面条(煮) | 110 | 4.5 | 0.5 | 22.0 |
| 全麦面包 | 247 | 13.0 | 3.4 | 41.3 |
| 白面包 | 265 | 9.0 | 3.2 | 49.0 |
| 红薯(蒸) | 86 | 1.6 | 0.1 | 20.1 |
| 玉米(煮) | 112 | 4.0 | 1.2 | 22.8 |
| 燕麦粥 | 71 | 2.5 | 1.5 | 12.0 |

### 肉类蛋类 (per 100g 生重)
| 食物 | 热量 | 蛋白质 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 鸡胸肉 | 133 | 31.0 | 1.2 | 0 |
| 鸡腿肉(去皮) | 119 | 20.0 | 3.9 | 0 |
| 鸡翅 | 222 | 18.0 | 16.0 | 0.6 |
| 猪里脊(瘦) | 155 | 20.0 | 7.9 | 0.7 |
| 猪五花肉 | 395 | 13.0 | 37.0 | 2.4 |
| 猪排骨 | 264 | 18.0 | 20.0 | 1.7 |
| 牛肉(瘦) | 125 | 22.0 | 4.2 | 0.2 |
| 牛肉(肥牛) | 250 | 17.0 | 20.0 | 0.1 |
| 羊肉 | 203 | 19.0 | 14.1 | 0 |
| 鸡蛋(1个≈50g) | 144 | 13.3 | 8.8 | 2.8 |
| 鸭蛋 | 180 | 12.6 | 13.0 | 3.1 |

### 鱼虾海鲜 (per 100g)
| 食物 | 热量 | 蛋白质 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 三文鱼 | 208 | 20.0 | 13.0 | 0 |
| 虾仁 | 99 | 20.0 | 1.0 | 0.2 |
| 鲈鱼 | 105 | 18.6 | 3.4 | 0 |
| 带鱼 | 127 | 17.7 | 4.9 | 3.1 |
| 鱿鱼 | 92 | 17.0 | 1.6 | 2.2 |

### 蔬菜 (per 100g)
| 食物 | 热量 | 蛋白质 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 西兰花 | 34 | 2.8 | 0.4 | 6.6 |
| 菠菜 | 23 | 2.9 | 0.4 | 3.6 |
| 番茄 | 18 | 0.9 | 0.2 | 3.9 |
| 黄瓜 | 16 | 0.7 | 0.1 | 2.9 |
| 白菜 | 13 | 1.5 | 0.1 | 2.2 |
| 胡萝卜 | 41 | 0.9 | 0.2 | 9.6 |
| 土豆 | 76 | 2.0 | 0.1 | 17.0 |
| 茄子 | 25 | 1.0 | 0.2 | 5.9 |
| 青椒 | 20 | 0.9 | 0.2 | 4.6 |
| 豆角 | 31 | 2.7 | 0.2 | 5.7 |
| 蘑菇 | 22 | 3.1 | 0.3 | 3.3 |
| 豆腐 | 76 | 8.1 | 3.7 | 2.8 |

### 水果 (per 100g 可食部分)
| 食物 | 热量 | 蛋白质 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 苹果 | 52 | 0.3 | 0.2 | 13.8 |
| 香蕉 | 89 | 1.1 | 0.3 | 22.8 |
| 橙子 | 47 | 0.9 | 0.1 | 11.8 |
| 葡萄 | 69 | 0.7 | 0.2 | 18.1 |
| 西瓜 | 30 | 0.6 | 0.1 | 6.8 |
| 草莓 | 32 | 0.7 | 0.3 | 7.7 |
| 蓝莓 | 57 | 0.7 | 0.3 | 14.5 |

### 常见中式菜肴 (per 100g)
| 食物 | 热量 | 蛋白质 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 番茄炒蛋 | 85 | 5.0 | 5.5 | 4.0 |
| 宫保鸡丁 | 180 | 14.0 | 10.0 | 8.0 |
| 鱼香肉丝 | 155 | 10.0 | 9.0 | 8.5 |
| 麻婆豆腐 | 115 | 8.0 | 7.0 | 5.0 |
| 红烧肉 | 305 | 10.0 | 28.0 | 4.0 |
| 糖醋排骨 | 250 | 14.0 | 16.0 | 12.0 |
| 清炒时蔬 | 40 | 2.0 | 2.5 | 3.0 |
| 蛋炒饭 | 170 | 5.5 | 6.0 | 23.0 |
| 饺子(猪肉白菜,1个≈25g) | 240 | 9.0 | 11.0 | 26.0 |

### 饮品
| 食物 | 热量 | 蛋白质 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 牛奶(250ml) | 155 | 7.5 | 8.5 | 12.0 |
| 豆浆(250ml) | 70 | 6.0 | 3.0 | 5.0 |
| 可乐(330ml) | 140 | 0 | 0 | 35.0 |
| 果汁(250ml) | 115 | 0.5 | 0.2 | 28.0 |
`

function buildSystemPrompt(mealType?: string): string {
  const hint = mealType ? MEAL_TYPE_HINTS[mealType] || "" : ""

  return `# Role
你是一位拥有20年临床经验的注册营养师，同时是计算机视觉食物分析专家。你精通中西方各类菜肴的识别，能仅凭照片精准判断食物种类、估算份量重量，并精确计算热量和宏量营养素。

# Task
分析用户上传的食物照片，识别所有食物，输出结构化的营养数据。

# Analysis Steps (Chain-of-Thought)
请按以下步骤在脑海中进行推理分析：

**第1步：扫描识别**
- 遍历图片中所有可见的餐具和食物
- 识别每个独立食物/菜肴的名称
- 注意区分主食、主菜、配菜、汤品、饮品、酱料

**第2步：份量估算**
- 根据餐具大小（碗/盘/杯的直径）、食物在餐具中的占比、常见份量来估算重量
- 参考：标准饭碗直径约11cm，满碗米饭约200g；标准餐盘直径约23cm
- 参考：一个鸡蛋大小≈50g；一副扑克牌大小肉片≈100g；一个拳头大小≈150-200g
- 对于混合菜肴（如番茄炒蛋），估算总重，成分比例自行判断

**第3步：营养计算**
- 根据每100g营养数据和估算重量，按比例计算热量和宏量营养素
- 参考下方营养数据库

**第4步：置信度评估**
- 0.90-1.00：食物清晰可辨，几乎确定（如完整的苹果、煎蛋）
- 0.80-0.89：比较确定，稍有遮挡或混合
- 0.70-0.79：基本确定，但有一定不确定性（如酱汁覆盖、远距离）
- 0.50-0.69：不太确定，基于有限视觉线索推测(如模糊、遮挡严重)

${hint}

# Nutrition Reference Database
${NUTRITION_DB}

# Output Format
你必须输出**纯JSON**，不要加任何前缀、后缀、代码块标记或解释文字。

JSON Schema:
\`\`\`
{
  "foods": [
    {
      "name": "食物名称（中文，简洁准确）",
      "estimated_weight_g": 数字(克),
      "calories": 数字(千卡),
      "protein_g": 数字(克),
      "fat_g": 数字(克),
      "carbs_g": 数字(克),
      "confidence": 数字(0-1)
    }
  ]
}
\`\`\`

# Critical Rules
1. **只输出JSON** — 如果输出任何非JSON内容，系统会崩溃
2. **所有数值必须是数字类型**，不能是字符串，不能带单位
3. **name 使用中文**，具体但不冗长。好的："番茄炒蛋"。不好的："一盘看起来像是用番茄和鸡蛋做的菜"
4. **如果无法识别**任何食物，返回 {"foods": []}
5. **饮品也要算**进去：汤、牛奶、豆浆、果汁、饮料等
6. **酱料和调料**如果份量很小（<10g），可以忽略
7. 对于**外卖/食堂餐盘**，可能有2-4个格子，分别识别每个格子的菜
8. 对于**火锅/麻辣烫**，尝试识别可见的主要食材

现在，请分析照片中的食物。`}

// ============================================================================
// Edge Function Handler
// ============================================================================

serve(async (req: Request) => {
  try {
    // CORS headers
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      })
    }

    // 1. Validate JWT
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return jsonResponse(401, { success: false, error: { code: "UNAUTHORIZED", message: "缺少认证信息" } })
    }

    const token = authHeader.replace("Bearer ", "")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    // Use service_role to validate JWT and get user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return jsonResponse(401, { success: false, error: { code: "UNAUTHORIZED", message: "认证失败" } })
    }

    // 2. Parse request body
    const body: RequestBody = await req.json()

    if (!body.imagePath) {
      return jsonResponse(400, { success: false, error: { code: "INVALID_REQUEST", message: "缺少 imagePath" } })
    }

    // 3. Security: verify imagePath belongs to the authenticated user
    const pathUserId = body.imagePath.split("/")[0]
    if (pathUserId !== user.id) {
      return jsonResponse(403, { success: false, error: { code: "FORBIDDEN", message: "无权访问此图片" } })
    }

    // 4. Download image from Storage
    const { data: imageData, error: downloadError } = await supabaseAdmin
      .storage
      .from("food-images")
      .download(body.imagePath)

    if (downloadError || !imageData) {
      return jsonResponse(400, { success: false, error: { code: "INVALID_IMAGE", message: "图片不存在或已损坏" } })
    }

    // Check file size (max 10MB for ZhipuAI)
    if (imageData.size > 10 * 1024 * 1024) {
      return jsonResponse(413, { success: false, error: { code: "STORAGE_LIMIT_EXCEEDED", message: "图片过大" } })
    }

    // 5. Convert to base64
    const buffer = await imageData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    const mimeType = imageData.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    // 6. Call ZhipuAI Vision API
    const apiKey = Deno.env.get("ZHIPUAI_API_KEY")
    if (!apiKey) {
      return jsonResponse(500, { success: false, error: { code: "CONFIG_ERROR", message: "AI 服务未配置" } })
    }

    const systemPrompt = buildSystemPrompt(body.mealType)

    console.log(`[proxy-ai] Calling ZhipuAI for user=${user.id}, mealType=${body.mealType || "none"}, size=${imageData.size} bytes`)

    const aiResponse = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4v-plus-0111",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              { type: "text", text: "请分析这张图片中的食物。" },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error(`[proxy-ai] ZhipuAI error: ${aiResponse.status} - ${errText}`)

      if (aiResponse.status === 429) {
        return jsonResponse(429, { success: false, error: { code: "AI_RATE_LIMITED", message: "AI 服务繁忙，请稍后重试" } })
      }
      return jsonResponse(500, { success: false, error: { code: "AI_ANALYSIS_FAILED", message: "AI 识别失败" } })
    }

    const aiResult = await aiResponse.json()
    const content = aiResult.choices?.[0]?.message?.content || ""

    console.log(`[proxy-ai] Raw AI response length: ${content.length}`)

    // 7. Parse structured JSON from AI response
    const foods = parseAIResponse(content)

    if (!foods || foods.length === 0) {
      return jsonResponse(200, {
        success: true,
        data: { foods: [] },
        _warning: "未能识别到食物，请尝试更清晰的图片",
      })
    }

    // 8. Validate and sanitize results
    const validatedFoods: AIFoodResult[] = foods.map((f: AIFoodResult) => ({
      name: String(f.name || "未知食物").slice(0, 100),
      estimated_weight_g: clamp(Number(f.estimated_weight_g) || 100, 1, 5000),
      calories: clamp(Number(f.calories) || 0, 0, 9999),
      protein_g: clamp(Number(f.protein_g) || 0, 0, 999),
      fat_g: clamp(Number(f.fat_g) || 0, 0, 999),
      carbs_g: clamp(Number(f.carbs_g) || 0, 0, 999),
      confidence: clamp(Number(f.confidence) || 0.7, 0, 1),
    }))

    console.log(`[proxy-ai] Identified ${validatedFoods.length} foods`)

    return jsonResponse(200, { success: true, data: { foods: validatedFoods } })

  } catch (err) {
    console.error(`[proxy-ai] Unexpected error:`, err)
    return jsonResponse(500, { success: false, error: { code: "AI_ANALYSIS_FAILED", message: "服务器内部错误" } })
  }
})

// ============================================================================
// Helpers
// ============================================================================

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

function clamp(value: number, min: number, max: number): number {
  if (isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

function parseAIResponse(content: string): AIFoodResult[] | null {
  // Try direct JSON parse
  let parsed: { foods?: AIFoodResult[] } | null = null

  // Attempt 1: Direct parse
  try {
    parsed = JSON.parse(content)
    if (parsed?.foods && Array.isArray(parsed.foods)) {
      return parsed.foods
    }
  } catch { /* continue */ }

  // Attempt 2: Extract from markdown code block ```json ... ```
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch) {
    try {
      parsed = JSON.parse(codeBlockMatch[1])
      if (parsed?.foods && Array.isArray(parsed.foods)) {
        return parsed.foods
      }
    } catch { /* continue */ }
  }

  // Attempt 3: Find first { and last } to extract JSON object
  const firstBrace = content.indexOf("{")
  const lastBrace = content.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonStr = content.slice(firstBrace, lastBrace + 1)
      parsed = JSON.parse(jsonStr)
      if (parsed?.foods && Array.isArray(parsed.foods)) {
        return parsed.foods
      }
    } catch { /* continue */ }
  }

  // Attempt 4: Look for array of foods directly
  const firstBracket = content.indexOf("[")
  const lastBracket = content.lastIndexOf("]")
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      const arrayStr = content.slice(firstBracket, lastBracket + 1)
      const arr = JSON.parse(arrayStr)
      if (Array.isArray(arr) && arr.length > 0 && arr[0].name) {
        return arr
      }
    } catch { /* continue */ }
  }

  console.error(`[proxy-ai] Failed to parse AI response: ${content.slice(0, 500)}`)
  return null
}
