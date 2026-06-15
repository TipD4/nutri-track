# NutriTrack API Design

> **原则：** Supabase 项目中「后端 API」有两大类：
> 1. **Supabase Client SDK 直接调用** — PostgreSQL 表操作，RLS 自动执行权限检查
> 2. **Supabase Edge Functions** — 代理 AI API 调用、复杂聚合查询
>
> 所有接口通过 `VITE_SUPABASE_ANON_KEY` 鉴权，RLS 确保用户数据隔离。

---

## 目录

1. [TypeScript 类型定义](#1-typescript-类型定义)
2. [Auth API](#2-auth-api)
3. [Profile API](#3-profile-api)
4. [Diet Records API](#4-diet-records-api)
5. [Weight API](#5-weight-api)
6. [Image API](#6-image-api)
7. [Dashboard API](#7-dashboard-api)
8. [AI Proxy Edge Function](#8-ai-proxy-edge-function)
9. [AI Nutrition Analysis Edge Function](#9-ai-nutrition-analysis-edge-function)
10. [错误码总览](#10-错误码总览)
11. [权限矩阵](#11-权限矩阵)

---

## 1. TypeScript 类型定义

### 1.1 数据库行类型（由 Supabase CLI 生成）

```typescript
// types/database.ts — 通过 `npx supabase gen types` 自动生成
// 以下为手动书写，实际开发时由 CLI 生成

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      meal_records: {
        Row: MealRecord
        Insert: MealRecordInsert
        Update: MealRecordUpdate
      }
      food_items: {
        Row: FoodItem
        Insert: FoodItemInsert
        Update: FoodItemUpdate
      }
      food_images: {
        Row: FoodImage
        Insert: FoodImageInsert
        Update: FoodImageUpdate
      }
      weight_records: {
        Row: WeightRecord
        Insert: WeightRecordInsert
        Update: WeightRecordUpdate
      }
      ai_analysis_results: {
        Row: AIAnalysisResult
        Insert: AIAnalysisResultInsert
        // no Update — analysis is regenerated
      }
    }
  }
}
```

### 1.2 业务类型

```typescript
// ==================== User / Profile ====================

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  target_calories: number | null
  target_protein_g: number | null
  target_fat_g: number | null
  target_carbs_g: number | null
  created_at: string
  updated_at: string
}

interface ProfileInsert {
  id: string // must match auth.users.id
  display_name?: string
  target_calories?: number
  target_protein_g?: number
  target_fat_g?: number
  target_carbs_g?: number
}

interface ProfileUpdate {
  display_name?: string
  target_calories?: number | null
  target_protein_g?: number | null
  target_fat_g?: number | null
  target_carbs_g?: number | null
}

// ==================== Meal Records ====================

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
type RecordSource = 'manual' | 'ai'

interface MealRecord {
  id: string
  user_id: string
  meal_type: MealType
  recorded_at: string
  source: RecordSource
  note: string | null
  created_at: string
  updated_at: string
  food_items: FoodItem[] // JOIN query
}

interface MealRecordInsert {
  meal_type: MealType
  recorded_at?: string    // defaults to now()
  source?: RecordSource   // defaults to 'manual'
  note?: string
}

interface MealRecordUpdate {
  meal_type?: MealType
  recorded_at?: string
  note?: string | null
}

// ==================== Food Items ====================

interface FoodItem {
  id: string
  meal_record_id: string
  name: string
  weight_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  confidence: number | null  // only for AI source
  created_at: string
}

interface FoodItemInsert {
  meal_record_id: string
  name: string
  weight_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  confidence?: number
}

interface FoodItemUpdate {
  name?: string
  weight_g?: number
  calories?: number
  protein_g?: number
  fat_g?: number
  carbs_g?: number
  confidence?: number | null
}

// ==================== Weight ====================

interface WeightRecord {
  id: string
  user_id: string
  weight_kg: number
  recorded_date: string // 'YYYY-MM-DD'
  created_at: string
}

interface WeightRecordInsert {
  weight_kg: number
  recorded_date: string // 'YYYY-MM-DD'
}

// ==================== Food Images ====================

interface FoodImage {
  id: string
  user_id: string
  meal_record_id: string | null
  storage_path: string
  thumbnail_path: string | null
  created_at: string
}

// ==================== AI Analysis ====================

type AnalysisType = 'daily' | 'weekly' | 'monthly'

interface AIAnalysisResult {
  id: string
  user_id: string
  analysis_type: AnalysisType
  period_start: string // 'YYYY-MM-DD'
  period_end: string   // 'YYYY-MM-DD'
  analysis_json: AnalysisContent
  created_at: string
}

interface AnalysisContent {
  summary: {
    avgDailyCalories: number
    avgDailyProtein: number
    avgDailyFat: number
    avgDailyCarbs: number
  }
  analysis: string       // Markdown
  recommendations: string[] // 建议列表
}

// ==================== AI Food Recognition ====================

interface AIFoodResult {
  name: string
  estimated_weight_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  confidence: number // 0-1
}

interface AIProxyRequest {
  imagePath: string    // storage path: "{user_id}/{uuid}.{ext}"
  mealType?: MealType  // optional hint for better AI results
}

interface AIProxySuccessResponse {
  success: true
  data: {
    foods: AIFoodResult[]
  }
}

interface AIProxyErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

// ==================== AI Nutrition Analysis ====================

interface AnalysisRequest {
  type: AnalysisType
  periodStart: string // 'YYYY-MM-DD'
  periodEnd: string   // 'YYYY-MM-DD'
}

interface AnalysisSuccessResponse {
  success: true
  data: AnalysisContent
}

// ==================== Dashboard ====================

interface DashboardData {
  todayCalories: number
  todayProtein: number
  todayFat: number
  todayCarbs: number
  calorieTarget: number | null
  proteinTarget: number | null
  fatTarget: number | null
  carbsTarget: number | null
  weightTrend: WeightRecord[]
  recentRecords: MealRecord[]
  latestAnalysis: AIAnalysisResult | null
}

// ==================== Pagination ====================

interface PaginatedResponse<T> {
  data: T[]
  count: number
  hasMore: boolean
}

interface PaginationParams {
  limit?: number  // default 20
  offset?: number // default 0
}
```

---

## 2. Auth API

**实现方式：** Supabase Auth Client SDK  
**鉴权：** 无需 RLS（Supabase Auth 系统自带）  
**权限：** 公开（anon key 可用）

### 2.1 登录

```
supabase.auth.signInWithPassword({ email, password })
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | ✅ | 用户邮箱 |
| password | string | ✅ | 密码 (≥6 chars) |

**成功返回：**
```typescript
{
  data: {
    user: User,       // Supabase User 对象
    session: Session  // JWT + refresh token
  },
  error: null
}
```

**错误码：** `invalid_credentials` | `email_not_confirmed`

### 2.2 退出

```
supabase.auth.signOut()
```

无参数。清除本地 session。无返回值（void）。

### 2.3 获取当前用户

```
supabase.auth.getUser()
```

**返回：** `{ data: { user: User | null }, error: null }`

### 2.4 监听认证状态变化

```
supabase.auth.onAuthStateChange((event, session) => { ... })
```

用于 AuthContext 自动同步。事件类型：`SIGNED_IN` | `SIGNED_OUT` | `TOKEN_REFRESHED` | `USER_UPDATED`

> **简化说明：** 个人应用中不需要 `signUp`（注册）、`verifyOtp`（验证邮箱）、`resetPasswordForEmail`（重置密码）。
> 账号由开发者在 Supabase Dashboard 手动创建。

---

## 3. Profile API

**实现方式：** Supabase Client SDK → `public.profiles`  
**RLS：** `auth.uid() = id`  
**权限：** 已认证用户可读写自己的 profile

### 3.1 获取自己的 Profile

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .single()
```

**请求参数：** 无（RLS 自动按 auth.uid() 过滤）  
**返回：** `Profile`

### 3.2 更新 Profile

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({ display_name: '新名字', target_calories: 2000 })
  .eq('id', userId)
  .select()
  .single()
```

**请求：** `ProfileUpdate`  
**返回：** `Profile`  
**Validation：** 前端 Zod 校验

---

## 4. Diet Records API

**实现方式：** Supabase Client SDK → `public.meal_records` + `public.food_items`  
**RLS：** `meal_records`: `auth.uid() = user_id`, `food_items`: JOIN 验证所有权  
**权限：** 已认证用户全权限

> **关键设计：** 创建/更新 meal_record 时需同时操作 food_items。
> 由于 Supabase 客户端不支持事务，采用以下方案：
> 1. 先 INSERT meal_record → 获得 id
> 2. 再 INSERT food_items (带 meal_record_id)
> 3. 如果 food_items 插入失败，DELETE 已创建的 meal_record（回滚）
>
> 或使用 Edge Function 在服务端用 service_role 执行事务。

### 4.1 获取记录列表

```typescript
const { data, error } = await supabase
  .from('meal_records')
  .select('*, food_items(*)')
  .eq('user_id', authUserId) // RLS 会自动过滤，显式加更安全
  .order('recorded_at', { ascending: false })
  .range(offset, offset + limit - 1)
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | ❌ | 筛选日期 'YYYY-MM-DD' |
| mealType | MealType | ❌ | 筛选餐次 |
| limit | number | ❌ | 默认 20 |
| offset | number | ❌ | 默认 0 |

**返回：** `PaginatedResponse<MealRecord>`

### 4.2 获取单条记录

```typescript
const { data, error } = await supabase
  .from('meal_records')
  .select('*, food_items(*)')
  .eq('id', recordId)
  .single()
```

**返回：** `MealRecord`  
**错误码：** `NOT_FOUND` (PGRST116)

### 4.3 创建记录

```
POST (Supabase INSERT)
```

**请求体：**
```typescript
{
  meal: MealRecordInsert
  foods: Omit<FoodItemInsert, 'meal_record_id'>[]
}
```

**实现：**
```typescript
// Step 1: create meal record
const { data: meal } = await supabase
  .from('meal_records')
  .insert({ meal_type, recorded_at, source, note })
  .select()
  .single()

// Step 2: create food items
const foodInserts = foods.map(f => ({ ...f, meal_record_id: meal.id }))
const { data: items } = await supabase
  .from('food_items')
  .insert(foodInserts)
  .select()

// Result: { ...meal, food_items: items }
```

**返回：** `MealRecord` (含 food_items)  
**错误码：** `VALIDATION_ERROR` (前端校验失败)

### 4.4 更新记录

```
PATCH (Supabase UPDATE)
```

**请求体：** `MealRecordUpdate`

食物更新策略：先删除旧 food_items，再插入新的。

```typescript
// Step 1: update meal fields
await supabase.from('meal_records').update({ meal_type, note }).eq('id', id)

// Step 2: replace food items
await supabase.from('food_items').delete().eq('meal_record_id', id)
await supabase.from('food_items').insert(newFoods.map(f => ({ ...f, meal_record_id: id })))
```

> 另一种方案：客户端对比 diff，只更新/删除/新增变化项。MVP 阶段先全量替换。

**返回：** `MealRecord` (含更新后的 food_items)

### 4.5 删除记录

```typescript
const { error } = await supabase
  .from('meal_records')
  .delete()
  .eq('id', recordId)
```

**返回：** `null` (成功)  
**副作用：** CASCADE 删除关联 food_items，SET NULL food_images.meal_record_id

---

## 5. Weight API

**实现方式：** Supabase Client SDK → `public.weight_records`  
**RLS：** `auth.uid() = user_id`  

### 5.1 获取体重列表

```typescript
const { data, error } = await supabase
  .from('weight_records')
  .select('*')
  .order('recorded_date', { ascending: false })
  .range(offset, offset + limit - 1)
```

**返回：** `PaginatedResponse<WeightRecord>`

### 5.2 获取趋势数据

```typescript
const { data, error } = await supabase
  .from('weight_records')
  .select('recorded_date, weight_kg')
  .gte('recorded_date', startDate)
  .lte('recorded_date', endDate)
  .order('recorded_date', { ascending: true })
```

**参数：** `startDate: string`, `endDate: string` (YYYY-MM-DD)  
**返回：** `{ recorded_date: string; weight_kg: number }[]`

### 5.3 记录/更新体重

使用 UPSERT 语义：每天一条记录，如有重复则更新。

```typescript
const { data, error } = await supabase
  .from('weight_records')
  .upsert(
    { weight_kg, recorded_date },
    { onConflict: 'user_id, recorded_date' }
  )
  .select()
  .single()
```

**请求：** `WeightRecordInsert`  
**返回：** `WeightRecord`  
**错误码：** `DUPLICATE_WEIGHT` (如不用 upsert)，`VALIDATION_ERROR` (weight_kg ≤ 0)

### 5.4 删除体重记录

```typescript
const { error } = await supabase
  .from('weight_records')
  .delete()
  .eq('id', recordId)
```

---

## 6. Image API

**实现方式：** Supabase Storage SDK + `public.food_images` 表  
**RLS：** Storage 按 user_id 文件夹隔离 + food_images 表按 user_id  

### 6.1 上传图片

```
1. 前端压缩 (compress.js / canvas) → max 1920px, < 2MB
2. 上传到 Storage
3. 写入 food_images 表
```

```typescript
// Step 1: upload to storage
const filePath = `${userId}/${crypto.randomUUID()}.${ext}`
const { data: uploadData, error: uploadError } = await supabase
  .storage
  .from('food-images')
  .upload(filePath, compressedFile)

// Step 2: record in database
const { data: imageRecord, error: dbError } = await supabase
  .from('food_images')
  .insert({
    storage_path: filePath,
    user_id: userId,
  })
  .select()
  .single()
```

**请求：** `File` (multipart, image/jpeg|png|webp|heic|heif)  
**返回：** `FoodImage` (含 storage_path + public URL)  
**错误码：** `STORAGE_LIMIT_EXCEEDED` (图 >5MB)

### 6.2 获取图片公开 URL

```typescript
const { data } = supabase
  .storage
  .from('food-images')
  .getPublicUrl(storagePath)

// data.publicUrl → 可直接用于 <img src="...">
```

### 6.3 获取图片历史

```typescript
const { data, error } = await supabase
  .from('food_images')
  .select('*')
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)
```

**返回：** `PaginatedResponse<FoodImage>`

### 6.4 关联图片到餐食记录

```typescript
// After saving an AI-recognized meal:
await supabase
  .from('food_images')
  .update({ meal_record_id: recordId })
  .eq('id', imageId)
```

### 6.5 删除图片

```typescript
// Step 1: delete from storage
await supabase.storage.from('food-images').remove([storagePath])

// Step 2: delete from database
await supabase.from('food_images').delete().eq('id', imageId)
```

---

## 7. Dashboard API

**实现方式：** React Query 并行请求（客户端聚合）  
**无新端点** — 复用已有 API

```typescript
// Parallel queries for dashboard data
const dashboardQueries = {
  todayMeals: () =>
    supabase
      .from('meal_records')
      .select('*, food_items(*)')
      .eq('user_id', userId)
      .gte('recorded_at', todayStart)
      .lte('recorded_at', todayEnd),

  weightTrend: () =>
    supabase
      .from('weight_records')
      .select('recorded_date, weight_kg')
      .gte('recorded_date', thirtyDaysAgo)
      .order('recorded_date', { ascending: true }),

  recentRecords: () =>
    supabase
      .from('meal_records')
      .select('*, food_items(*)')
      .order('recorded_at', { ascending: false })
      .limit(5),

  latestAnalysis: () =>
    supabase
      .from('ai_analysis_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
}

// Execute in parallel with useQueries or Promise.all
```

**返回：** `DashboardData`（前端聚合后）

### 7.1 今日营养汇总计算

```typescript
// 客户端聚合逻辑（在 React Query select 中执行）
function aggregateTodayNutrition(meals: MealRecord[]) {
  const allFoods = meals.flatMap(m => m.food_items)
  return {
    calories: sum(allFoods, 'calories'),
    protein: sum(allFoods, 'protein_g'),
    fat: sum(allFoods, 'fat_g'),
    carbs: sum(allFoods, 'carbs_g'),
  }
}
```

---

## 8. AI Proxy Edge Function

**端点：** `POST /functions/v1/proxy-ai`  
**鉴权：** Bearer {user_jwt}  
**RLS：** Edge Function 内使用 service_role key 调用 Storage  
**环境变量：** `OPENAI_API_KEY` 或 `GEMINI_API_KEY`

### 8.1 请求

```http
POST /functions/v1/proxy-ai
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "imagePath": "abc123-def456/550e8400-e29b.jpg",
  "mealType": "lunch"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| imagePath | string | ✅ | Storage 中的图片路径 |
| mealType | MealType | ❌ | 餐次 hint，帮助 AI 判断菜系 |

### 8.2 处理流程（Edge Function 内部）

```
1. 验证 JWT → 提取 user_id
2. 验证 imagePath 属于该 user_id（前缀匹配）
3. 从 Storage 下载图片 → base64
4. 调用 OpenAI/Gemini Vision API
5. 验证 AI 返回的 JSON 结构
6. 如果解析失败 → fallback 重试或返回错误
7. 返回标准化结果
```

### 8.3 成功响应 (200)

```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "name": "鸡胸肉沙拉",
        "estimated_weight_g": 250,
        "calories": 320,
        "protein_g": 38.5,
        "fat_g": 12.0,
        "carbs_g": 15.5,
        "confidence": 0.92
      }
    ]
  }
}
```

### 8.4 错误响应

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | `UNAUTHORIZED` | JWT 无效/过期 |
| 403 | `FORBIDDEN` | 图片不属于该用户 |
| 400 | `INVALID_IMAGE` | 图片格式不支持或损坏 |
| 500 | `AI_ANALYSIS_FAILED` | AI 返回格式错误或 API 异常 |
| 429 | `AI_RATE_LIMITED` | AI API 超频（按 user_id 限流） |
| 504 | `AI_TIMEOUT` | AI 响应超时（>30s） |

### 8.5 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "AI_ANALYSIS_FAILED",
    "message": "食物识别失败，请重新拍摄更清晰的照片"
  }
}
```

---

## 9. AI Nutrition Analysis Edge Function

**端点：** `POST /functions/v1/analyze-nutrition`  
**鉴权：** Bearer {user_jwt}  
**RLS：** Edge Function 内使用 service_role key 查询数据  
**环境变量：** `OPENAI_API_KEY` 或 `GEMINI_API_KEY`

### 9.1 请求

```http
POST /functions/v1/analyze-nutrition
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "type": "weekly",
  "periodStart": "2026-06-08",
  "periodEnd": "2026-06-15"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | AnalysisType | ✅ | daily/weekly/monthly |
| periodStart | string | ✅ | YYYY-MM-DD |
| periodEnd | string | ✅ | YYYY-MM-DD |

### 9.2 处理流程（Edge Function 内部）

```
1. 验证 JWT → 提取 user_id
2. 查询该时段所有 meal_records + food_items
3. 查询该时段 weight_records
4. 查询用户营养目标 (profiles.target_*)
5. 前端聚合每日数据
6. 构造 prompt → 调用 AI (GPT-4/Gemini)
7. 将结果写入 ai_analysis_results 表（缓存）
8. 返回分析结果
```

### 9.3 成功响应 (200)

```json
{
  "success": true,
  "data": {
    "summary": {
      "avgDailyCalories": 2100,
      "avgDailyProtein": 95.5,
      "avgDailyFat": 65.2,
      "avgDailyCarbs": 280.3,
      "weightChange": -0.5
    },
    "analysis": "## 本周营养分析\n\n### 🔥 热量摄入\n本周日均热量摄入 2100 kcal，低于目标 2300 kcal...\n\n### 💪 蛋白质\n日均蛋白质 95.5g，达到目标 90g 的 106%...\n\n### ⚠️ 需要注意\n- 周三脂肪摄入偏高...",
    "recommendations": [
      "增加早餐蛋白质摄入，当前早餐以碳水为主",
      "周三晚餐脂肪占比过高，建议减少油炸食品",
      "继续保持当前蛋白质摄入水平"
    ]
  }
}
```

### 9.4 错误响应

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | `UNAUTHORIZED` | JWT 无效 |
| 400 | `INSUFFICIENT_DATA` | 该时段无饮食记录 |
| 500 | `ANALYSIS_FAILED` | AI 生成失败 |
| 429 | `AI_RATE_LIMITED` | AI 调用超频 |

---

## 10. 错误码总览

| 错误码 | 来源 | HTTP 状态 | 说明 |
|--------|------|----------|------|
| `invalid_credentials` | Supabase Auth | 400 | 邮箱或密码错误 |
| `UNAUTHORIZED` | Edge Function / RLS | 401 | JWT 无效或过期 |
| `FORBIDDEN` | RLS Policy | 403 | 数据不属于当前用户 |
| `NOT_FOUND` | Supabase (PGRST116) | 404 | 记录不存在 |
| `VALIDATION_ERROR` | 前端 Zod 校验 | 422 | 请求数据格式不合法 |
| `DUPLICATE_WEIGHT` | DB UNIQUE 约束 | 409 | 当天已有体重记录 |
| `STORAGE_LIMIT_EXCEEDED` | Storage | 413 | 图片超过 5MB |
| `INVALID_IMAGE` | Edge Function | 400 | 图片格式不支持 |
| `AI_ANALYSIS_FAILED` | Edge Function | 500 | AI 识别失败 |
| `AI_RATE_LIMITED` | Edge Function | 429 | AI API 调用超频 |
| `AI_TIMEOUT` | Edge Function | 504 | AI 响应超时 |
| `ANALYSIS_FAILED` | Edge Function | 500 | 营养分析生成失败 |
| `INSUFFICIENT_DATA` | Edge Function | 400 | 无足够数据进行分析 |

### 客户端统一错误处理

```typescript
// services/errorHandler.ts
interface AppError {
  code: string
  message: string // 用户可读的中文提示
  status: number
}

function handleSupabaseError(error: PostgrestError): AppError {
  // 将 Supabase 错误码映射为用户可读消息
}

function handleEdgeFunctionError(response: AIProxyErrorResponse): AppError {
  // Edge Function 已经返回标准格式
}
```

---

## 11. 权限矩阵

### 11.1 用户角色

本项目只有一个角色：**个人用户**。无管理员、无多租户。

### 11.2 数据库操作权限

| 表/资源 | 未认证 (anon) | 已认证 (自己的数据) | 已认证 (他人数据) | service_role |
|----------|---------------|---------------------|-------------------|--------------|
| `profiles` | ❌ | SELECT, UPDATE | ❌ | ALL |
| `meal_records` | ❌ | ALL | ❌ | ALL |
| `food_items` | ❌ | ALL (via JOIN) | ❌ | ALL |
| `food_images` | ❌ | ALL | ❌ | ALL |
| `weight_records` | ❌ | ALL | ❌ | ALL |
| `ai_analysis_results` | ❌ | SELECT, INSERT, DELETE | ❌ | ALL |
| Storage `food-images` | ❌ | ALL (own folder) | ❌ | ALL |

### 11.3 Edge Function 权限

| Function | 鉴权方式 | 数据库权限 |
|----------|---------|-----------|
| `proxy-ai` | JWT + user_id 验证 | Storage: read own files (via JWT user context) |
| `analyze-nutrition` | JWT + user_id 验证 | DB: read own records, insert analysis |

> Edge Functions 内部使用 `service_role` key 构建 Supabase client，
> 但必须手动验证 user_id 对所有操作进行范围限制。

---

## Appendix: 前端服务层接口定义

以下为前端 `services/` 目录中每个模块的函数签名（设计阶段，不实现）：

```typescript
// services/authService.ts
function signIn(email: string, password: string): Promise<User>
function signOut(): Promise<void>
function getCurrentUser(): Promise<User | null>
function onAuthChange(callback: (user: User | null) => void): () => void

// services/profileService.ts
function getProfile(): Promise<Profile>
function updateProfile(data: ProfileUpdate): Promise<Profile>

// services/recordService.ts
function getRecords(params: { date?: string; mealType?: MealType; page?: number }): Promise<PaginatedResponse<MealRecord>>
function getRecord(id: string): Promise<MealRecord>
function createRecord(meal: MealRecordInsert, foods: Omit<FoodItemInsert, 'meal_record_id'>[]): Promise<MealRecord>
function updateRecord(id: string, meal: MealRecordUpdate, foods: Omit<FoodItemInsert, 'meal_record_id'>[]): Promise<MealRecord>
function deleteRecord(id: string): Promise<void>

// services/weightService.ts
function getWeightRecords(params: { page?: number }): Promise<PaginatedResponse<WeightRecord>>
function getWeightTrend(startDate: string, endDate: string): Promise<{ recorded_date: string; weight_kg: number }[]>
function upsertWeight(data: WeightRecordInsert): Promise<WeightRecord>
function deleteWeight(id: string): Promise<void>

// services/imageService.ts
function uploadImage(file: File): Promise<FoodImage>
function getImages(params: { page?: number }): Promise<PaginatedResponse<FoodImage>>
function linkImageToMeal(imageId: string, mealRecordId: string): Promise<void>
function deleteImage(id: string): Promise<void>

// services/aiService.ts
function recognizeFood(request: AIProxyRequest): Promise<AIProxySuccessResponse>

// services/analysisService.ts
function getNutritionAnalysis(request: AnalysisRequest): Promise<AnalysisSuccessResponse>

// services/dashboardService.ts
function getDashboardData(): Promise<DashboardData>
```
