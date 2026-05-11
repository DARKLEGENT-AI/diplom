import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const SupportPage = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [topic, setTopic] = useState('Проблема с доступом')
  const [conversation, setConversation] = useState([
    {
      id: 'support-1',
      author: 'Оператор',
      time: '10:24',
      text: 'Здравствуйте! Опишите вопрос по записи к врачу, свободным окнам, профилю или отчетам.',
    },
  ])
  const [pendingNotice, setPendingNotice] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!message.trim()) return

    const now = new Date()
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

    setConversation((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        author: 'Вы',
        time,
        text: `[${topic}] ${message.trim()}`,
      },
    ])
    setMessage('')
    setPendingNotice('Обращение принято. Специалист поддержки ответит в чате.')
  }

  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">Поддержка</p>
          <h2 className="mt-2 text-3xl font-semibold">Чат с оператором</h2>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#1f1f1f] hover:border-[#9aa3ad]">
          Назад
        </button>
      </div>

      <div className="mt-6 grid gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
        {conversation.map((item) => (
          <div key={item.id} className={`rounded-lg p-4 text-sm ${item.author === 'Вы' ? 'ml-auto max-w-[70%] bg-[#dc2626]/20 text-[#1f1f1f]' : 'bg-white text-[#1f1f1f]'}`}>
            <p className="text-xs text-[#4b5563]">{item.author} · {item.time}</p>
            {item.text}
          </div>
        ))}
        {pendingNotice && (
          <div className="rounded-lg bg-white p-4 text-sm text-[#1f1f1f]">
            <p className="text-xs text-[#4b5563]">Оператор · сейчас</p>
            {pendingNotice}
          </div>
        )}
      </div>

      <form className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_130px]" onSubmit={handleSubmit}>
        <select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]">
          <option>Проблема с доступом</option>
          <option>Запись к врачу</option>
          <option>Свободные окна</option>
          <option>Отчеты</option>
          <option>Справочники и настройки</option>
        </select>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Введите сообщение" className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]" />
        <button type="submit" className="rounded-lg bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white">
          Отправить
        </button>
      </form>
    </div>
  )
}

export default SupportPage
