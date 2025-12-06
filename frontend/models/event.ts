export interface Event {
    id: number
    name: string
    description?: string
    location: string
    startTime: string
    endTime: string

    published: boolean
    capacity?: number

    pointsRemaining: number
    pointsAwarded: number

    // for event detailing (i.e., user IDs)
    organizers?: number[]
    guests?: number[]
}