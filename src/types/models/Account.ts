export interface Account {
    id: number
    email: string
    lastname: string
    firstname: string
    bod: string
    password: string
    role: number
    avatarimg: string
    createdate: string
    updatedate: string
    isdeleted: boolean
    refreshtoken: string
    refreshtokenexpires: string
}
