"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"

interface Lesson {
  id: string
  date: string
  startTime: string
  endTime: string
  type: "INDIVIDUAL" | "GROUP"
  studentIds: string[]
  students?: Array<{ id: string; name: string }>
  groupId: string | null
  isRecurring: boolean
  recurringEndDate: string | null
  notes: string | null
  coach?: {
    id: string
    name: string | null
  }
}

interface CoachCalendarProps {
  userId: string
}

export function CoachCalendar({ userId }: CoachCalendarProps) {
  const { user } = useUser()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [usersList, setUsersList] = useState<Array<{ id: string; name: string; studentName: string | null; email: string | null }>>([])
  const [groupsList, setGroupsList] = useState<Array<{ id: string; name: string; members: Array<{ user: { name: string | null; studentName: string | null; email: string | null } }> }>>([])
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    type: "INDIVIDUAL" as "INDIVIDUAL" | "GROUP",
    studentIds: [] as string[],
    selectedGroupId: "",
    isRecurring: false,
    recurringEndDate: "",
    notes: "",
  })
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [error, setError] = useState("")

  const canEdit = user?.role === "ADMIN" || user?.role === "COACH"
  const canView = canEdit || user?.role === "MEMBER"

  useEffect(() => {
    if (canView) {
      fetchLessons()
    }
    if (canEdit) {
      fetchUsers()
      fetchGroups()
    }
  }, [currentWeek, canView, canEdit])

  const fetchLessons = async () => {
    try {
      const weekStart = getWeekStart(currentWeek)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/lessons?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
        { cache: 'no-store' }
      )
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      }
    } catch (error) {
      console.error("Error fetching lessons:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setUsersList(data.filter((u: any) => u.role === "MEMBER"))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups", { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setGroupsList(data)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
    return new Date(d.setDate(diff))
  }

  const getWeekDays = () => {
    const weekStart = getWeekStart(currentWeek)
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getHours = () => {
    const hours = []
    for (let i = 8; i <= 22; i++) {
      hours.push(i)
    }
    return hours
  }

  const getLessonsForDateAndHour = (date: Date, hour: number) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      return lessons.filter(lesson => {
        try {
          const lessonDate = new Date(lesson.date)
          if (isNaN(lessonDate.getTime())) return false
          const lessonDateStr = lessonDate.toISOString().split('T')[0]
          if (lessonDateStr !== dateStr) return false
          
          const [startH, startM] = lesson.startTime.split(':').map(Number)
          const [endH, endM] = lesson.endTime.split(':').map(Number)
          const startTotal = startH * 60 + startM
          const endTotal = endH * 60 + endM
          const hourStart = hour * 60
          const hourEnd = (hour + 1) * 60
          
          // Check if lesson overlaps with this hour
          return startTotal < hourEnd && endTotal > hourStart
        } catch (e) {
          return false
        }
      })
    } catch (e) {
      return []
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    // Set time to noon to avoid timezone issues
    const dateWithTime = new Date(date)
    dateWithTime.setHours(12, 0, 0, 0)
    
    // Get the hour from the clicked date
    const clickedHour = date.getHours()
    const clickedMinute = date.getMinutes()
    
    // Format start time (clicked hour:minute)
    const startTime = `${clickedHour.toString().padStart(2, '0')}:${clickedMinute.toString().padStart(2, '0')}`
    
    // Default end time is 1 hour later
    const endHour = clickedHour + 1
    const endTime = `${endHour.toString().padStart(2, '0')}:${clickedMinute.toString().padStart(2, '0')}`
    
    setFormData({
      ...formData,
      date: dateWithTime.toISOString(),
      startTime: startTime,
      endTime: endTime,
      selectedGroupId: "",
    })
    setShowForm(true)
    setEditingLesson(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.startTime || !formData.endTime) {
      setError("Başlangıç ve bitiş saati gereklidir")
      return
    }

    if (formData.type === "GROUP" && !formData.selectedGroupId) {
      setError("Grup dersi için lütfen bir grup seçin")
      return
    }

    if (formData.type === "INDIVIDUAL" && formData.studentIds.length === 0) {
      setError("Bireysel ders için en az bir öğrenci seçilmelidir")
      return
    }

    try {
      const url = editingLesson ? `/api/lessons/${editingLesson.id}` : "/api/lessons"
      const method = editingLesson ? "PUT" : "POST"

      let recurringEndDateValue = null
      if (formData.isRecurring && formData.recurringEndDate && formData.recurringEndDate.trim()) {
        try {
          const date = new Date(formData.recurringEndDate)
          if (!isNaN(date.getTime())) {
            recurringEndDateValue = date.toISOString()
          }
        } catch (e) {
          console.error("Invalid recurring end date:", e)
        }
      }

      // If group is selected, get member IDs from the group
      let finalStudentIds = formData.studentIds
      if (formData.type === "GROUP" && formData.selectedGroupId) {
        const selectedGroup = groupsList.find(g => g.id === formData.selectedGroupId)
        if (selectedGroup) {
          finalStudentIds = selectedGroup.members.map(member => member.user.id)
        }
      }

      const requestBody = {
        date: formData.date || new Date().toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        studentIds: finalStudentIds,
        groupId: formData.type === "GROUP" && formData.selectedGroupId ? formData.selectedGroupId : null,
        isRecurring: formData.isRecurring,
        recurringEndDate: recurringEndDateValue,
        notes: formData.notes || null,
      }

      console.log("Sending lesson data:", requestBody)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          date: "",
          startTime: "",
          endTime: "",
          type: "INDIVIDUAL",
          studentIds: [],
          selectedGroupId: "",
          isRecurring: false,
          recurringEndDate: "",
          notes: "",
        })
        setEditingLesson(null)
        fetchLessons()
      } else {
        const data = await response.json()
        console.error("Error response:", data)
        setError(data.error || data.details?.[0]?.message || "Ders kaydedilirken bir hata oluştu")
      }
    } catch (error) {
      setError("Ders kaydedilirken bir hata oluştu")
    }
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Bu dersi silmek istediğinizden emin misiniz?")) return

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchLessons()
      }
    } catch (error) {
      alert("Ders silinirken bir hata oluştu")
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    
    let lessonDate = new Date().toISOString()
    try {
      const date = new Date(lesson.date)
      if (!isNaN(date.getTime())) {
        lessonDate = date.toISOString()
      }
    } catch (e) {
      console.error("Invalid lesson date:", e)
    }

    let recurringEndDateValue = ""
    if (lesson.recurringEndDate) {
      try {
        const date = new Date(lesson.recurringEndDate)
        if (!isNaN(date.getTime())) {
          date.setHours(12, 0, 0, 0)
          recurringEndDateValue = date.toISOString()
        }
      } catch (e) {
        console.error("Invalid recurring end date:", e)
      }
    }

    setFormData({
      date: lessonDate,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      type: lesson.type,
      studentIds: lesson.studentIds.length > 0 ? lesson.studentIds : [],
      selectedGroupId: lesson.groupId || "",
      isRecurring: lesson.isRecurring,
      recurringEndDate: recurringEndDateValue,
      notes: lesson.notes || "",
    })
    setShowForm(true)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setDate(prev.getDate() + 7)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const addStudent = (userId: string) => {
    if (!formData.studentIds.includes(userId)) {
      setFormData({
        ...formData,
        studentIds: [...formData.studentIds, userId],
      })
    }
  }

  const removeStudent = (userId: string) => {
    setFormData({
      ...formData,
      studentIds: formData.studentIds.filter(id => id !== userId),
    })
  }

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ]

  const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
  const dayNamesShort = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>
  }

  const weekDays = getWeekDays()
  const hours = getHours()
  const weekStart = getWeekStart(currentWeek)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateWeek('prev')}
          className="rounded-lg border border-[#0b0b0b]/10 bg-white px-4 py-2 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
        >
          ← Önceki Hafta
        </button>
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#0b0b0b]">
            {weekStart.getDate()} {monthNames[weekStart.getMonth()]} - {weekEnd.getDate()} {monthNames[weekEnd.getMonth()]} {weekEnd.getFullYear()}
          </h3>
          <button
            onClick={goToToday}
            className="text-sm text-gold-600 hover:text-gold-700 font-medium mt-1"
          >
            Bugüne Git
          </button>
        </div>
        <button
          onClick={() => navigateWeek('next')}
          className="rounded-lg border border-[#0b0b0b]/10 bg-white px-4 py-2 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
        >
          Sonraki Hafta →
        </button>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="rounded-2xl border border-[#0b0b0b]/6 bg-white p-4 shadow-lg shadow-black/10 overflow-auto max-h-[calc(100vh-300px)]">
        <div className="min-w-[900px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-2">
            <div className="text-xs font-semibold text-gold-700 py-2 sticky left-0 bg-white z-10 text-center">
              Saat
            </div>
            {weekDays.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString()
              return (
                <div
                  key={idx}
                  className={`text-center text-sm font-semibold py-2 ${
                    isToday ? 'text-gold-700 bg-gold-50 rounded-lg' : 'text-[#0b0b0b]'
                  }`}
                >
                  <div>{dayNamesShort[idx]}</div>
                  <div className={`text-xs ${isToday ? 'font-bold' : 'font-normal'}`}>
                    {day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hour Rows */}
          <div className="space-y-1">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] gap-2">
                {/* Hour Label */}
                <div className="text-xs font-medium text-[#4a4a4a] py-1.5 sticky left-0 bg-white z-10 border-r border-[#0b0b0b]/5 text-center">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                
                {/* Day Cells */}
                {weekDays.map((day, dayIdx) => {
                  const dayLessons = getLessonsForDateAndHour(day, hour)
                  const isToday = day.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={dayIdx}
                      onClick={() => {
                        if (canEdit) {
                          const clickedDate = new Date(day)
                          clickedDate.setHours(hour, 0, 0, 0)
                          handleDateClick(clickedDate)
                        }
                      }}
                      className={`
                        min-h-[50px] p-1 rounded border transition relative
                        ${canEdit ? 'cursor-pointer hover:border-gold-400 hover:bg-gold-50/50' : 'cursor-default'}
                        ${isToday ? 'border-gold-400 bg-gold-50/30' : 'border-[#0b0b0b]/5 bg-white'}
                        group
                      `}
                    >
                      {dayLessons.map(lesson => {
                        const [startH, startM] = lesson.startTime.split(':').map(Number)
                        const [endH, endM] = lesson.endTime.split(':').map(Number)
                        const isFirstHour = hour === startH
                        
                        // Only show lesson in the hour it starts
                        if (!isFirstHour) return null
                        
                        // Calculate position and height
                        const startTotal = startH * 60 + startM
                        const endTotal = endH * 60 + endM
                        const duration = endTotal - startTotal
                        const topPercent = (startM / 60) * 100
                        const heightPercent = (duration / 60) * 100
                        const rowHeight = 50 // min-h-[50px] = 50px
                        const actualHeight = Math.max((duration / 60) * rowHeight, 35)
                        
                        return (
                          <div
                            key={lesson.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (canEdit) {
                                handleEdit(lesson)
                              }
                            }}
                            className={`
                              absolute left-1 right-1 rounded-lg px-2 py-1.5 text-xs font-medium shadow-sm
                              z-20 transition
                              ${canEdit ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : 'cursor-default'}
                              ${lesson.type === 'INDIVIDUAL' 
                                ? 'bg-blue-500 text-white border border-blue-600' 
                                : 'bg-purple-500 text-white border border-purple-600'
                              }
                            `}
                            style={{
                              top: `${topPercent}%`,
                              height: `${actualHeight}px`,
                              minHeight: '40px',
                            }}
                            title={
                              user?.role === "MEMBER"
                                ? `${lesson.startTime} - ${lesson.endTime}\nAntrenör: ${lesson.coach?.name || 'Bilinmiyor'}\nTip: ${lesson.type === 'INDIVIDUAL' ? 'Bireysel' : 'Grup'}${lesson.notes ? `\nNot: ${lesson.notes}` : ''}`
                                : `${lesson.startTime} - ${lesson.endTime}\nÖğrenciler: ${lesson.students?.map(s => s.name).join(', ') || 'Yükleniyor...'}\nTip: ${lesson.type === 'INDIVIDUAL' ? 'Bireysel' : 'Grup'}${lesson.notes ? `\nNot: ${lesson.notes}` : ''}`
                            }
                          >
                            <div className="font-bold text-[11px] mb-0.5">
                              {lesson.startTime} - {lesson.endTime}
                            </div>
                            <div className="truncate text-[10px] opacity-95 font-medium">
                              {user?.role === "MEMBER" ? (
                                // MEMBER için antrenör adı
                                lesson.coach?.name || 'Antrenör'
                              ) : (
                                // ADMIN/COACH için öğrenci adları
                                <>
                                  {lesson.students?.slice(0, 2).map(s => s.name).join(', ') || 'Yükleniyor...'}
                                  {lesson.students && lesson.students.length > 2 && ` +${lesson.students.length - 2}`}
                                </>
                              )}
                            </div>
                            <div className="text-[9px] opacity-80 mt-0.5">
                              {lesson.type === 'INDIVIDUAL' ? 'Bireysel' : 'Grup Dersi'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Lesson Button - Only for ADMIN and COACH */}
      {canEdit && (
        <button
          onClick={() => {
            setShowForm(true)
            setEditingLesson(null)
            const today = new Date()
            today.setHours(12, 0, 0, 0)
            setFormData({
              date: today.toISOString(),
              startTime: "",
              endTime: "",
              type: "INDIVIDUAL",
              studentIds: [],
              isRecurring: false,
              recurringEndDate: "",
              notes: "",
            })
          }}
          className="w-full rounded-lg bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
        >
          + Yeni Ders Ekle
        </button>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#0b0b0b]">
                  {editingLesson ? "Dersi Düzenle" : "Yeni Ders Ekle"}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingLesson(null)
                    setError("")
                  }}
                  className="text-[#4a4a4a] hover:text-[#0b0b0b]"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                      Tarih *
                    </label>
                    <input
                      type="date"
                      value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value)
                          date.setHours(12, 0, 0, 0)
                          setFormData({ ...formData, date: date.toISOString() })
                        }
                      }}
                      required
                      className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                      Ders Tipi *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value as "INDIVIDUAL" | "GROUP"
                        setFormData({ 
                          ...formData, 
                          type: newType,
                          selectedGroupId: newType === "INDIVIDUAL" ? "" : formData.selectedGroupId,
                          studentIds: newType === "INDIVIDUAL" ? formData.studentIds : []
                        })
                      }}
                      required
                      className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                    >
                      <option value="INDIVIDUAL">Bireysel Ders</option>
                      <option value="GROUP">Grup Dersi</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                      Başlangıç Saati *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                      Bitiş Saati *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                </div>

                {formData.type === "GROUP" ? (
                  <div>
                    <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                      Grup Seçin *
                    </label>
                    <select
                      value={formData.selectedGroupId}
                      onChange={(e) => {
                        const selectedGroup = groupsList.find(g => g.id === e.target.value)
                        setFormData({ 
                          ...formData, 
                          selectedGroupId: e.target.value,
                          studentIds: selectedGroup 
                            ? selectedGroup.members.map(m => m.user.id)
                            : []
                        })
                      }}
                      required
                      className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                    >
                      <option value="">Grup seçin...</option>
                      {groupsList.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.members.length} üye)
                        </option>
                      ))}
                    </select>
                    {formData.selectedGroupId && (
                      <div className="mt-2 p-3 bg-gold-50 rounded-lg border border-gold-200">
                        <p className="text-xs font-semibold text-gold-800 mb-1">Grup Üyeleri:</p>
                        <div className="flex flex-wrap gap-1">
                          {groupsList.find(g => g.id === formData.selectedGroupId)?.members.map((member, idx) => (
                            <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gold-300 text-gold-700">
                              {member.user.studentName || member.user.name || member.user.email || "İsimsiz"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                      Öğrenciler *
                    </label>
                    <div className="space-y-2 mb-2">
                      {formData.studentIds.map((userId) => {
                        const user = usersList.find(u => u.id === userId)
                        return user ? (
                          <div key={userId} className="flex items-center justify-between rounded-xl border border-gold-200 bg-gold-50 px-4 py-2">
                            <span className="text-sm text-gold-800">
                              {user.studentName || user.name || user.email || "İsimsiz"}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeStudent(userId)}
                              className="text-red-600 hover:text-red-800 text-sm font-semibold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addStudent(e.target.value)
                          e.target.value = ""
                        }
                      }}
                      className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                    >
                      <option value="">Öğrenci seçin...</option>
                      {usersList.filter(u => !formData.studentIds.includes(u.id)).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.studentName || user.name || user.email || "İsimsiz"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="rounded border-[#0b0b0b]/10"
                    />
                    <span className="text-sm font-medium text-[#0b0b0b]">
                      Haftalık tekrar eden ders
                    </span>
                  </label>
                  {formData.isRecurring && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                        Tekrar Bitiş Tarihi *
                      </label>
                      <input
                        type="date"
                        value={formData.recurringEndDate ? new Date(formData.recurringEndDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value)
                            date.setHours(12, 0, 0, 0)
                            setFormData({ ...formData, recurringEndDate: date.toISOString() })
                          } else {
                            setFormData({ ...formData, recurringEndDate: "" })
                          }
                        }}
                        required={formData.isRecurring}
                        className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0b0b0b] mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-[#0b0b0b]/10 bg-[#f7f4ec] px-4 py-3 text-sm text-[#0b0b0b] focus:border-gold-400 focus:outline-none"
                    placeholder="Ders hakkında notlar..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:shadow-gold-400/40"
                  >
                    {editingLesson ? "Güncelle" : "Kaydet"}
                  </button>
                  {editingLesson && canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingLesson.id)}
                      className="rounded-lg border border-red-400/50 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Sil
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingLesson(null)
                      setError("")
                    }}
                    className="rounded-lg border border-[#0b0b0b]/10 bg-white px-5 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#f7f4ec]"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
