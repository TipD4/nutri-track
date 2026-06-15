# NutriTrack Frontend Architecture

> **Vite SPA + React 18 + TypeScript + TailwindCSS + Supabase**

---

## 1. Project Structure

```
src/
├── features/
│   ├── auth/                          # 认证
│   │   ├── components/LoginForm.tsx
│   │   ├── hooks/useAuth.ts           # AuthContext hook
│   │   ├── pages/LoginPage.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/                     # 仪表盘
│   │   ├── components/
│   │   │   ├── CalorieRing.tsx        # 热量环形进度
│   │   │   ├── MacroBarChart.tsx      # 三大营养素柱状图
│   │   │   ├── WeightTrendChart.tsx   # 体重趋势折线
│   │   │   ├── RecentRecords.tsx      # 最近记录列表
│   │   │   └── AIAnalysisCard.tsx     # AI 分析摘要卡片
│   │   ├── hooks/useDashboardData.ts  # 聚合查询
│   │   ├── pages/DashboardPage.tsx
│   │   └── index.ts
│   │
│   ├── records/                       # 饮食记录
│   │   ├── components/
│   │   │   ├── MealTypeTabs.tsx       # 早餐/午餐/晚餐/加餐 Tab
│   │   │   ├── RecordList.tsx         # 记录列表
│   │   │   ├── RecordCard.tsx         # 单条记录卡片
│   │   │   ├── FoodItemRow.tsx        # 单行食物信息
│   │   │   └── FoodForm.tsx           # 手动录入表单（动态行）
│   │   ├── hooks/
│   │   │   ├── useRecords.ts          # 记录列表查询
│   │   │   ├── useRecord.ts           # 单条记录查询
│   │   │   ├── useCreateRecord.ts     # 创建 mutation
│   │   │   ├── useUpdateRecord.ts     # 更新 mutation
│   │   │   └── useDeleteRecord.ts     # 删除 mutation
│   │   ├── pages/
│   │   │   ├── RecordsPage.tsx        # 记录列表
│   │   │   ├── RecordNewPage.tsx      # 手动录入
│   │   │   └── RecordEditPage.tsx     # 编辑记录
│   │   └── index.ts
│   │
│   ├── ai-recognition/                # AI 图片识别
│   │   ├── components/
│   │   │   ├── ImageUploader.tsx      # 图片上传（拖拽/拍照）
│   │   │   ├── AIResultPreview.tsx    # AI 结果预览（只读）
│   │   │   └── AIResultEditor.tsx     # 结果编辑（用户修改）
│   │   ├── hooks/
│   │   │   ├── useImageRecognition.ts # AI 识别流程
│   │   │   └── useImageUpload.ts      # 图片上传
│   │   ├── pages/AIRecordPage.tsx     # AI 录入页面
│   │   └── index.ts
│   │
│   ├── weight/                        # 体重管理
│   │   ├── components/
│   │   │   ├── WeightChart.tsx        # 趋势图
│   │   │   └── WeightLogForm.tsx      # 体重录入
│   │   ├── hooks/
│   │   │   ├── useWeightRecords.ts    # 列表查询
│   │   │   ├── useWeightTrend.ts      # 趋势查询
│   │   │   └── useUpsertWeight.ts     # 录入/更新
│   │   ├── pages/WeightPage.tsx
│   │   └── index.ts
│   │
│   ├── analysis/                      # AI 营养分析
│   │   ├── components/
│   │   │   ├── PeriodSelector.tsx     # 日/周/月选择器
│   │   │   └── AnalysisContent.tsx    # Markdown 渲染
│   │   ├── hooks/useAnalysis.ts       # 分析查询 + 触发
│   │   ├── pages/AnalysisPage.tsx
│   │   └── index.ts
│   │
│   ├── images/                        # 图片历史
│   │   ├── components/
│   │   │   ├── ImageGrid.tsx          # 图片网格
│   │   │   └── ImageCard.tsx          # 单张图片卡片
│   │   ├── hooks/useImages.ts         # 图片列表查询
│   │   ├── pages/
│   │   │   ├── ImagesPage.tsx         # 图片列表
│   │   │   └── ImageDetailPage.tsx    # 图片详情
│   │   └── index.ts
│   │
│   └── settings/                      # 用户设置
│       ├── components/
│       │   ├── ProfileForm.tsx        # 个人信息
│       │   └── TargetForm.tsx         # 营养目标
│       ├── hooks/
│       │   ├── useProfile.ts          # 读取
│       │   └── useUpdateProfile.ts    # 更新
│       ├── pages/SettingsPage.tsx
│       └── index.ts
│
├── shared/                            # 共享（跨 feature 使用）
│   └── components/
│       ├── ui/                        # 基础 UI 组件
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Modal.tsx
│       │   ├── Card.tsx
│       │   ├── Spinner.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ErrorMessage.tsx
│       │   ├── ErrorBoundary.tsx       # 错误边界
│       │   └── ConfirmDialog.tsx
│       ├── layout/                    # 布局组件
│       │   ├── AppLayout.tsx          # 主布局（Sidebar + Content）
│       │   ├── Sidebar.tsx            # 桌面侧栏
│       │   ├── BottomNav.tsx          # 移动端底部导航
│       │   └── ProtectedRoute.tsx     # 路由守卫
│       └── charts/                    # 图表封装
│           ├── RingChart.tsx          # 环形图
│           └── TrendChart.tsx         # 趋势折线图
│
├── services/                          # 外部服务调用层
│   ├── supabase.ts                    # Supabase client 创建 + 导出
│   ├── authService.ts                 # signIn / signOut / getUser
│   ├── profileService.ts             # getProfile / update
│   ├── recordService.ts              # CRUD meal_records + food_items
│   ├── weightService.ts              # CRUD weight_records + trend
│   ├── imageService.ts               # upload / list / link / delete
│   ├── aiService.ts                  # proxy-ai Edge Function
│   └── analysisService.ts            # analyze-nutrition Edge Function
│
├── hooks/                             # 全局 hooks（跨 feature）
│   └── useMediaQuery.ts              # 响应式断点检测
│
├── stores/                            # Zustand stores（纯 UI 状态）
│   ├── uiStore.ts                    # sidebar 展开、当前 tab、modal 状态
│   └── aiResultStore.ts              # AI 识别临时结果（用户未保存前）
│
├── lib/                               # 纯工具函数
│   ├── constants.ts                   # MEAL_TYPES, MACRO_TARGETS 等常量
│   ├── format.ts                      # formatDate, formatCalories
│   ├── cn.ts                          # classnames 工具
│   ├── nutrition.ts                   # sumCalories, calcMacroPercent
│   ├── error-messages.ts              # 错误码 → 用户可读中文消息映射
│   └── zod-schemas.ts                 # 所有 Zod validation schemas
│
├── types/                             # TypeScript 类型
│   ├── database.ts                    # Supabase 生成的类型
│   ├── food.ts                        # MealRecord, FoodItem, AIFoodResult
│   ├── weight.ts                      # WeightRecord, WeightTrend
│   ├── analysis.ts                    # AnalysisType, AnalysisContent
│   └── user.ts                        # Profile, UserTargets
│
├── App.tsx                            # Router + QueryClientProvider + AuthProvider
├── main.tsx                           # ReactDOM.createRoot
└── index.css                          # Tailwind directives + 全局样式
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
<App>
  <QueryClientProvider>
    <AuthProvider>
      <Router>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* AppLayout: Sidebar (desktop) + BottomNav (mobile) + <Outlet /> */}

            <Route index               element={<DashboardPage />}  />
            <Route path="records"      element={<RecordsPage />}    />
            <Route path="records/new"  element={<RecordNewPage />}  />
            <Route path="records/new/ai" element={<AIRecordPage />}/>
            <Route path="records/:id"     element={<RecordEditPage />}/>
            <Route path="weight"       element={<WeightPage />}     />
            <Route path="analysis"     element={<AnalysisPage />}   />
            <Route path="images"       element={<ImagesPage />}     />
            <Route path="images/:id"   element={<ImageDetailPage />}/>
            <Route path="settings"     element={<SettingsPage />}   />
          </Route>
        </Route>
      </Router>
    </AuthProvider>
  </QueryClientProvider>
</App>
```

### 2.2 Three-State Pattern (每个数据组件必须处理)

```typescript
// Every data-driven component follows this pattern:
type Props = {
  // Component-specific props
}

// Internal state machine:
//
//   loading → <Spinner />
//   error   → <ErrorMessage message={...} onRetry={...} />
//   empty   → <EmptyState icon={...} message="暂无记录" action={...} />
//   data    → <ActualContent data={...} />
//
// This is NON-NEGOTIABLE. Every component that fetches data
// MUST handle all 4 states.
```

### 2.3 Component Classification

| 类型 | 位置 | 职责 | 示例 |
|------|------|------|------|
| **Page** | `features/*/pages/` | 路由挂载点，组合 feature 组件 | `DashboardPage` |
| **Feature Component** | `features/*/components/` | 业务逻辑 + UI，仅在本 feature 使用 | `CalorieRing`, `RecordCard` |
| **Shared UI** | `shared/components/ui/` | 纯展示，无业务逻辑，跨 feature 复用 | `Button`, `Modal`, `Card` |
| **Layout** | `shared/components/layout/` | 页面结构，导航 | `AppLayout`, `Sidebar` |
| **Shared Chart** | `shared/components/charts/` | Recharts 封装，统一样式 | `RingChart` |

---

## 3. State Management

### 3.1 三层状态架构

```
┌─────────────────────────────────────────────────────────────┐
│                    State Architecture                        │
│                                                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   AuthContext     │  │   Zustand    │  │  React Query  │ │
│  │   (React Context) │  │   (UI State) │  │ (Server State)│ │
│  │                   │  │              │  │               │ │
│  │ · user            │  │ · sidebar    │  │ · records     │ │
│  │ · session         │  │   expanded?  │  │ · weights     │ │
│  │ · isAuthenticated │  │ · active tab │  │ · profile     │ │
│  │                   │  │ · modal open │  │ · images      │ │
│  │                   │  │ · AI result  │  │ · analysis    │ │
│  │                   │  │   (temp)     │  │ · dashboard   │ │
│  └──────────────────┘  └──────────────┘  └───────────────┘ │
│                                                              │
│  Rule: If data comes from Supabase → React Query             │
│  Rule: If data is transient UI → Zustand                     │
│  Rule: If data is global + auth → AuthContext                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Zustand Stores

```typescript
// stores/uiStore.ts — 纯 UI 状态
interface UIStore {
  // 侧栏
  sidebarExpanded: boolean
  toggleSidebar: () => void

  // 饮食记录页 — 当前选中的餐次 Tab
  activeMealTab: MealType
  setActiveMealTab: (tab: MealType) => void

  // 全局 modal
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
}

// stores/aiResultStore.ts — AI 识别临时结果（用户未保存前）
interface AIResultStore {
  result: AIFoodResult[] | null
  imagePath: string | null
  mealType: MealType | null
  setResult: (result: AIFoodResult[], imagePath: string, mealType: MealType) => void
  updateFood: (index: number, updates: Partial<AIFoodResult>) => void
  clearResult: () => void
}
```

### 3.3 React Query Keys

```typescript
// Query key factory — 集中管理，避免 key 冲突
const queryKeys = {
  profile:        ['profile'] as const,
  records:        (params?: { date?: string; mealType?: string }) => ['records', params] as const,
  record:         (id: string) => ['records', id] as const,
  weightRecords:  (params?: { page?: number }) => ['weights', params] as const,
  weightTrend:    (start: string, end: string) => ['weights', 'trend', start, end] as const,
  images:         (params?: { page?: number }) => ['images', params] as const,
  analysis:       (type: AnalysisType, start: string, end: string) => ['analysis', type, start, end] as const,
  dashboard:      ['dashboard'] as const,
}
```

### 3.4 AuthContext

```typescript
// features/auth/hooks/useAuth.ts
interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean    // true during initial session recovery
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```

---

## 4. Routing Design

### 4.1 Route Configuration (Lazy Loaded)

```typescript
// All feature pages are lazy-loaded for code splitting
const DashboardPage  = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const RecordsPage    = lazy(() => import('@/features/records/pages/RecordsPage'))
const RecordNewPage  = lazy(() => import('@/features/records/pages/RecordNewPage'))
const AIRecordPage   = lazy(() => import('@/features/ai-recognition/pages/AIRecordPage'))
const RecordEditPage = lazy(() => import('@/features/records/pages/RecordEditPage'))
const WeightPage     = lazy(() => import('@/features/weight/pages/WeightPage'))
const AnalysisPage   = lazy(() => import('@/features/analysis/pages/AnalysisPage'))
const ImagesPage     = lazy(() => import('@/features/images/pages/ImagesPage'))
const ImageDetailPage = lazy(() => import('@/features/images/pages/ImageDetailPage'))
const SettingsPage   = lazy(() => import('@/features/settings/pages/SettingsPage'))

// Fallback for all lazy routes
const PageFallback = () => (
  <div className="flex justify-center items-center h-64">
    <Spinner size="lg" />
  </div>
)
```

### 4.2 Route Table

| Path | Component | Lazy | Auth Required |
|------|-----------|------|---------------|
| `/login` | `LoginPage` | No (eager) | No |
| `/` | Redirect → `/dashboard` | - | Yes |
| `/dashboard` | `DashboardPage` | Yes | Yes |
| `/records` | `RecordsPage` | Yes | Yes |
| `/records/new` | `RecordNewPage` | Yes | Yes |
| `/records/new/ai` | `AIRecordPage` | Yes | Yes |
| `/records/:id` | `RecordEditPage` | Yes | Yes |
| `/weight` | `WeightPage` | Yes | Yes |
| `/analysis` | `AnalysisPage` | Yes | Yes |
| `/images` | `ImagesPage` | Yes | Yes |
| `/images/:id` | `ImageDetailPage` | Yes | Yes |
| `/settings` | `SettingsPage` | Yes | Yes |

### 4.3 ProtectedRoute Logic

```typescript
function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Spinner fullScreen />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
```

---

## 5. Data Flow

### 5.1 Standard Data Flow Pattern

```
User Action
    │
    ▼
Page Component  ──→  calls hook  ──→  hook calls service  ──→  Supabase
                                                                    │
    ◄───────────────────────────────────────────────────────────────┘
    │
    ▼
React Query cache updated
    │
    ▼
Component re-renders with new data
```

### 5.2 AI Recognition Flow (Complex)

```
AIRecordPage
    │
    ├── ImageUploader ──→ 用户选择图片
    │       │
    │       ├── 前端压缩 (canvas, max 1920px, <2MB)
    │       │
    │       ├── imageService.upload(file) ──→ Supabase Storage
    │       │       │
    │       │       └── 返回 storage_path + DB record
    │       │
    │       └── aiResultStore.setImagePath(path)
    │
    ├── [用户点击"开始识别"]
    │       │
    │       └── aiService.recognizeFood({ imagePath, mealType })
    │               │
    │               ├── → Edge Function (proxy-ai)
    │               ├── → OpenAI/Gemini Vision API
    │               │
    │               ├── 成功 → aiResultStore.setResult(foods)
    │               └── 失败 → ErrorMessage + 重试按钮
    │
    ├── AIResultPreview ──→ 展示 aiResultStore.result (只读)
    │
    ├── AIResultEditor ──→ 用户逐项修改 name/weight/calories/...
    │       │                ↓ aiResultStore.updateFood(index, updates)
    │       │
    │       └── [用户点击"保存"]
    │               │
    │               ├── recordService.createRecord(meal, foods)
    │               │       ├── INSERT meal_records (source='ai')
    │               │       └── INSERT food_items[]
    │               │
    │               ├── imageService.linkImageToMeal(imageId, mealId)
    │               │       └── UPDATE food_images SET meal_record_id = ...
    │               │
    │               ├── aiResultStore.clearResult()
    │               │
    │               └── navigate('/records')
```

### 5.3 Optimistic Updates

```typescript
// Used for: weight update, profile update (simple mutations)
function useUpsertWeight() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WeightRecordInsert) => weightService.upsert(data),
    onMutate: async (newWeight) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.weightRecords() })
      // Snapshot previous
      const previous = queryClient.getQueryData(queryKeys.weightRecords())
      // Optimistically update
      queryClient.setQueryData(queryKeys.weightRecords(), (old) => {
        // merge new weight into cache...
      })
      return { previous }
    },
    onError: (_err, _newWeight, context) => {
      // Rollback
      queryClient.setQueryData(queryKeys.weightRecords(), context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weightRecords() })
    },
  })
}
```

---

## 6. Shared Components

### 6.1 UI Library

| Component | Props | Usage across features |
|-----------|-------|----------------------|
| `Button` | `variant: 'primary' \| 'secondary' \| 'danger'`, `size`, `loading`, `disabled` | All forms, modals |
| `Input` | `label`, `error`, `type`, all HTMLInput attrs | All forms |
| `Modal` | `open`, `onClose`, `title`, `children` | Confirm dialogs, image preview |
| `Card` | `children`, `className` | Dashboard cards, record cards |
| `Spinner` | `size: 'sm' \| 'md' \| 'lg'`, `fullScreen?` | All loading states |
| `EmptyState` | `icon`, `message`, `action?: { label, onClick }` | Empty lists |
| `ErrorMessage` | `message`, `onRetry?` | Error states |
| `ConfirmDialog` | `open`, `title`, `message`, `onConfirm`, `onCancel` | Delete confirmations |

### 6.2 Charts

| Component | Library | Props |
|-----------|---------|-------|
| `RingChart` | Recharts `PieChart` | `value`, `target`, `label`, `color` |
| `TrendChart` | Recharts `LineChart` | `data: { date, value }[]`, `color`, `yLabel` |

### 6.3 Layout

```
AppLayout
├── Sidebar (desktop ≥768px)
│   ├── Logo + App name
│   ├── NavItem: 仪表盘    /dashboard
│   ├── NavItem: 饮食记录  /records
│   ├── NavItem: 体重管理  /weight
│   ├── NavItem: 营养分析  /analysis
│   ├── NavItem: 图片历史  /images
│   ├── NavItem: 设置      /settings
│   └── UserInfo + 退出按钮
│
├── Main Content Area
│   ├── <Suspense fallback={<PageFallback />}>
│   │   <Outlet />
│   └── </Suspense>
│
└── BottomNav (mobile <768px)
    ├── 仪表盘 | 记录 | 体重 | 分析 | 设置
    └── (5个 Tab，icon + 文字)
```

---

## 7. Mobile Responsive Strategy

### 7.1 Breakpoints (Tailwind Defaults)

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Default (mobile) | < 768px | BottomNav, 单列, 全宽卡片 |
| `md` | ≥ 768px | Sidebar, 双列可选 |
| `lg` | ≥ 1024px | Sidebar 展开, 更大 padding |

### 7.2 Mobile-First Rules

```
1. 所有样式从移动端开始写（无 prefix → mobile, md: → desktop）
2. 导航：移动端 = BottomNav (固定底部), 桌面端 = Sidebar (固定左侧)
3. 表单：移动端 = 全宽输入框, 桌面端 = max-w-md
4. Dashboard 卡片：移动端 = 单列堆叠, 桌面端 = grid-cols-2
5. 图片网格：移动端 = grid-cols-2, 桌面端 = grid-cols-3
6. 触摸目标：最小 44×44px（Tailwind p-3 ≈ 48px）
7. 模态框：移动端 = 全屏底部弹出, 桌面端 = 居中弹窗
```

### 7.3 Touch Optimization

```typescript
// 图片上传支持：
// - 点击选择文件 (<input type="file">)
// - 相机拍照 (<input type="file" capture="environment">)
// - 粘贴图片 (onPaste handler)
```

---

## 8. Performance Strategy

### 8.1 Code Splitting

| Bundle | Contents | Load Strategy |
|--------|----------|---------------|
| **Critical** | App shell, AuthProvider, LoginPage, React Router | Eager (initial load) |
| **Dashboard** | DashboardPage + 5 components + Recharts | Lazy (on navigation) |
| **Records** | RecordsPage, RecordNewPage, RecordEditPage, FoodForm | Lazy |
| **AI Recognition** | AIRecordPage, ImageUploader (with compress lib) | Lazy + dynamic import |
| **Weight** | WeightPage, WeightChart | Lazy |
| **Analysis** | AnalysisPage, react-markdown | Lazy |
| **Images** | ImagesPage, ImageDetailPage | Lazy |
| **Settings** | SettingsPage | Lazy |

### 8.2 Memo Strategy

```
Use React.memo for:
  ✅ RecordCard — rendered in lists, props change rarely
  ✅ ImageCard — rendered in grid
  ✅ FoodItemRow — in AI result editor list

Use useMemo for:
  ✅ Dashboard data aggregation (summarizeDaily, etc.)
  ✅ Chart data transformation

Use useCallback for:
  ✅ Event handlers passed to memo'd children
  ✅ Mutation callbacks (onSuccess, onError)

Do NOT memo:
  ❌ Simple presentational components with cheap renders
  ❌ Components that always receive new props
```

### 8.3 Image Optimization

```
1. Upload:  前端 canvas 压缩 → max 1920px, JPEG quality 0.8
2. Display: Storage getPublicUrl → URL 参数 ?width=400 for thumbnails
3. Fetch:   React Query staleTime: 5min (图片列表不常变)
```

---

## 9. Error Handling

### 9.1 Error Boundary

```typescript
// shared/components/ErrorBoundary.tsx
// Per-feature error boundaries, NOT just one global
// Prevents one feature crash from taking down the whole app

<AppLayout>
  <ErrorBoundary fallback={<DashboardErrorFallback />}>
    <DashboardPage />
  </ErrorBoundary>
</AppLayout>
```

### 9.2 API Error Handling Pattern

```typescript
// services/ 层的函数不吞错误，让 React Query 的 onError 处理
// hooks 层统一处理以下错误类型：

function useRecords(date: string) {
  return useQuery({
    queryKey: queryKeys.records({ date }),
    queryFn: () => recordService.getRecords({ date }),
    staleTime: 30_000,     // 30s 内不重新请求
    retry: 1,              // 失败重试 1 次
    // onError is handled per-component via the `error` state
  })
}

// Component 中使用：
function RecordsList() {
  const { data, isLoading, error, refetch } = useRecords(selectedDate)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={getUserMessage(error)} onRetry={refetch} />
  if (!data?.length) return <EmptyState message="今天还没记录饮食" />
  return data.map(record => <RecordCard key={record.id} record={record} />)
}
```

### 9.3 User-Facing Error Messages

```typescript
// lib/error-messages.ts
const ERROR_MESSAGES: Record<string, string> = {
  'invalid_credentials': '邮箱或密码错误',
  '23505':               '该日期已有体重记录',
  '23514':               '数据格式不正确',
  'PGRST116':            '记录不存在',
  'AI_ANALYSIS_FAILED':  '食物识别失败，请重新拍摄更清晰的照片',
  'STORAGE_LIMIT_EXCEEDED': '图片大小超过限制（最大5MB）',
  'NETWORK_ERROR':       '网络连接失败，请检查网络后重试',
}

function getUserMessage(error: unknown): string {
  // Extract error code and map to Chinese message
  // Fallback: "操作失败，请稍后重试"
}
```

---

## 10. Form Strategy

### 10.1 Zod Schemas (All in lib/zod-schemas.ts)

```typescript
// 登录
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

// 手动录入食物
const foodItemSchema = z.object({
  name: z.string().min(1, '请输入食物名称'),
  weight_g: z.number().positive('重量必须大于0'),
  calories: z.number().min(0, '热量不能为负数'),
  protein_g: z.number().min(0),
  fat_g: z.number().min(0),
  carbs_g: z.number().min(0),
})

// 餐食记录
const mealRecordSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  recorded_at: z.string().optional(),
  note: z.string().optional(),
  foods: z.array(foodItemSchema).min(1, '至少添加一种食物'),
})

// 体重
const weightSchema = z.object({
  weight_kg: z.number().positive('体重必须大于0').max(500, '请输入有效的体重'),
  recorded_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
})

// 营养目标
const targetsSchema = z.object({
  target_calories: z.number().positive().optional().nullable(),
  target_protein_g: z.number().positive().optional().nullable(),
  target_fat_g: z.number().positive().optional().nullable(),
  target_carbs_g: z.number().positive().optional().nullable(),
})
```

### 10.2 React Hook Form Integration

```typescript
// Every form follows this pattern:
function FoodForm({ onSubmit, defaultValues }: FoodFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FoodItem>({
    resolver: zodResolver(foodItemSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} label="食物名称" error={errors.name?.message} />
      {/* ... */}
      <Button type="submit" loading={isSubmitting}>保存</Button>
    </form>
  )
}
```

---

## 11. Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct Approach |
|----------------|-------------------|
| 在 feature 内部 import 另一个 feature 的组件 | Feature 之间通过 shared/ 或 routing 通信 |
| 在 services/ 中操作 UI state | services/ 只返回数据，UI state 在 hooks 中管理 |
| 在组件中直接调用 supabase client | 通过 services/ 封装，组件只调用 hooks |
| 使用 `useEffect` 做数据获取 | 使用 React Query 的 `useQuery` |
| 忽略 empty / error state | **所有**数据组件必须处理 4 种状态 |
| 传递 `user_id` 给 Supabase 请求 | RLS 自动处理，无需显式传递 |
| 在 render 中创建 inline object/function | memo + useCallback |
| 一个巨大的 CSS 文件 | Tailwind utility classes + 组件级 cn() |

---

## 12. GitHub Pages Deployment Considerations

### 12.1 Router Basename

GitHub Pages serves from `https://<username>.github.io/nutri-track/`:

```typescript
// App.tsx
<BrowserRouter basename="/nutri-track">
  {/* routes */}
</BrowserRouter>

// vite.config.ts
export default defineConfig({
  base: '/nutri-track/',
  resolve: {
    alias: { '@': '/src' }
  }
})
```

### 12.2 SPA Fallback

GitHub Pages doesn't natively support SPA routing. Options:

| 方案 | 优点 | 缺点 |
|------|------|------|
| **HashRouter** | 零配置，直接可用 | URL 中有 `#`，略丑 |
| **404.html trick** | 保持 clean URL | 需复制 `index.html` → `404.html` |

> **MVP 推荐：HashRouter**（个人应用，URL 美观不重要，稳定性优先）

```typescript
// 使用 HashRouter 替代 BrowserRouter
import { HashRouter } from 'react-router-dom'

<HashRouter>
  {/* routes — no basename needed */}
</HashRouter>
```

### 12.3 Build Script

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```

---

## Appendix: NPM Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "@supabase/supabase-js": "^2.43.0",
    "@tanstack/react-query": "^5.40.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.6.0",
    "zod": "^3.23.0",
    "recharts": "^2.12.0",
    "react-markdown": "^9.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "@headlessui/react": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```
