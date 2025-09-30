import { User } from "./user.type"

export interface ShareData {
    auth: Auth
}

interface Auth {
    user:User
}