import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'

export default function useNotifications() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    // Join personal notification room
    socket.emit('join_user', user.id)

    socket.on('notification', (notif) => {
      setNotifications((n) => [notif, ...n].slice(0, 20))
      setUnreadCount((c) => c + 1)
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('SmartTalent', { body: notif.message, icon: '/favicon.ico' })
      }
    })

    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => socket.disconnect()
  }, [user?.id])

  const markAllRead = () => setUnreadCount(0)

  const dismiss = (id) => {
    setNotifications((n) => n.filter((notif) => notif.id !== id))
  }

  return { notifications, unreadCount, markAllRead, dismiss }
}