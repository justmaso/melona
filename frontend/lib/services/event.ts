import { api } from "../api"
import { Event, Transaction } from "@/models"

export const EventService = {
    list: async () => {
        const response = await api.get<Event[]>("/events")
        return response.data
    },
    get: async (eventId: number) => {
        const response = await api.get<Event>(`/events/${eventId}`)
        return response.data
    },
    create: async (dto: Partial<Event>) => {
        const response = await api.post("/events", dto)
        return response.data
    },
    update: async (eventId: number, dto: Partial<Event>) => {
        const response = await api.patch(`/events/${eventId}`, dto)
        return response.data
    },
    delete: async (eventId: number) => {
        const response = await api.delete(`/events/${eventId}`)
        return response.data
    },
    addOrganizer: async (eventId: number, userId: number) => {
        const response = await api.post(`/events/${eventId}/organizers/${userId}`)
        return response.data
    },
    removeOrganizer: async (eventId: number, userId: number) => {
        const response = await api.delete(`/events/${eventId}/organizers/${userId}`)
        return response.data
    },
    rsvpMe: async (eventId: number) => {
        const response = await api.post(`/events/${eventId}/guests/me`)
        return response.data
    },
    unRsvpMe: async (eventId: number) => {
        const response = await api.delete(`/events/${eventId}/guests/me`)
        return response.data
    },
    addGuest: async (eventId: number, userId: number) => {
        const response = await api.post(`/events/${eventId}/guests`, { userId })
        return response.data
    },
    removeGuest: async (eventId: number, userId: number) => {
        const response = await api.delete(`/events/${eventId}/guests/${userId}`)
        return response.data
    },
    awardPoints: async (eventId: number) => {
        const response = await api.post<Transaction>(`/events/${eventId}/transactions`)
        return response.data
    }
}