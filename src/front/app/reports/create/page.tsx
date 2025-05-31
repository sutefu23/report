"use client"

import MainLayout from "@/components/layout/main-layout"
import { Badge } from "@/components/shadcn/ui/badge"
import { Button } from "@/components/shadcn/ui/button"
import { Calendar } from "@/components/shadcn/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/ui/form"
import { Input } from "@/components/shadcn/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select"
import { Textarea } from "@/components/shadcn/ui/textarea"
import { apiClient } from "@/lib/api"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, Plus, Save, Send, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

// Validation schema
const workTaskSchema = z.object({
  projectId: z.string().min(1, "プロジェクトを選択してください"),
  description: z.string().min(1, "作業内容を入力してください"),
  hoursSpent: z
    .number()
    .min(0, "作業時間は0以上である必要があります")
    .max(24, "作業時間は24時間以下である必要があります"),
  progress: z
    .number()
    .min(0, "進捗率は0%以上である必要があります")
    .max(100, "進捗率は100%以下である必要があります"),
})

const dailyReportSchema = z
  .object({
    date: z.date({
      required_error: "日付を選択してください",
    }),
    tasks: z.array(workTaskSchema).min(1, "少なくとも1つの作業記録が必要です"),
    challenges: z.string().optional(),
    nextDayPlan: z.string().optional(),
    memo: z.string().optional(),
  })
  .refine(
    (data) => {
      const totalHours = data.tasks.reduce(
        (sum, task) => sum + task.hoursSpent,
        0,
      )
      return totalHours <= 24
    },
    {
      message: "作業時間の合計は24時間以下である必要があります",
      path: ["tasks"],
    },
  )

type DailyReportFormData = z.infer<typeof dailyReportSchema>

// Mock projects - TODO: Replace with API call
const projects = [
  { id: "1", name: "Webサイトリニューアル" },
  { id: "2", name: "モバイルアプリ開発" },
  { id: "3", name: "データベース最適化" },
  { id: "4", name: "セキュリティ監査" },
  { id: "5", name: "その他" },
]

export default function CreateDailyReport() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)

  const form = useForm<DailyReportFormData>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      date: new Date(),
      tasks: [
        {
          projectId: "",
          description: "",
          hoursSpent: 0,
          progress: 0,
        },
      ],
      challenges: "",
      nextDayPlan: "",
      memo: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  })

  const addTask = () => {
    append({
      projectId: "",
      description: "",
      hoursSpent: 0,
      progress: 0,
    })
  }

  const removeTask = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = async (data: DailyReportFormData, isDraft = false) => {
    setIsLoading(true)
    try {
      const reportData = {
        date: format(data.date, "yyyy-MM-dd"),
        tasks: data.tasks,
        challenges: data.challenges || "",
        nextDayPlan: data.nextDayPlan || "",
        memo: data.memo || "",
        status: isDraft ? "draft" : "submitted",
      }

      await apiClient.createDailyReport(reportData)

      router.push("/reports")
    } catch (error) {
      console.error("Failed to create daily report:", error)
      // TODO: Show error toast
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = (data: DailyReportFormData) => {
    onSubmit(data, true)
  }

  const handleSubmit = (data: DailyReportFormData) => {
    onSubmit(data, false)
  }

  const totalHours = form
    .watch("tasks")
    .reduce((sum, task) => sum + (task.hoursSpent || 0), 0)

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">日報作成</h1>
            <p className="text-muted-foreground">
              今日の作業内容を記録しましょう
            </p>
          </div>
          <Badge variant={totalHours > 24 ? "destructive" : "secondary"}>
            合計: {totalHours}時間
          </Badge>
        </div>

        <Form {...form}>
          <form className="space-y-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>日付</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy年MM月dd日", {
                                  locale: ja,
                                })
                              ) : (
                                <span>日付を選択</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Work Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>作業記録</CardTitle>
                  <Button type="button" variant="outline" onClick={addTask}>
                    <Plus className="mr-2 h-4 w-4" />
                    作業追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">作業 {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Project Selection */}
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.projectId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>プロジェクト</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="プロジェクトを選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem
                                    key={project.id}
                                    value={project.id}
                                  >
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Work Hours */}
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.hoursSpent`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>作業時間（時間）</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max="24"
                                placeholder="8"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>作業内容</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="具体的な作業内容を記入してください"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Progress */}
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.progress`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>進捗率（%）</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="80"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseInt(e.target.value) || 0,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>その他</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="challenges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>課題・困ったこと</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="今日遭遇した課題や困ったことがあれば記入してください"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextDayPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>明日の予定</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="明日の作業予定を記入してください"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メモ（任意）</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="その他のメモがあれば記入してください"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={form.handleSubmit(handleSaveDraft)}
                  disabled={isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  下書き保存
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  提出
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  )
}
