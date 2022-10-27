import fetch  from 'node-fetch'

interface Guild {
  id: number
}

interface User {
  uuid: string,
  firstLogin: Date
  lastLogin: Date
  lastLogout: Date
  name: string
  displayName: string
  rank?: string
  karma: string
  socialMedia?: {
    twitter?: string,
    youtube?: string,
    instagram?: string,
    twitch?: string
    discord?: string,
    hypixel?: string
  }
}

interface HypixelResponse {
  success: boolean
}

interface UserResponse extends HypixelResponse {
  player: {
    _id: string
    uuid: string
    displayname: string
    firstLogin: number
    lastLogin: number
    lastLogout: number
    playername: string
    karma: string
    rank?: string
    socialMedia?: {
      prompt: boolean
      links:  {
        YOUTUBE?: string
        TWITTER?: string
        INSTAGRAM?: string
        HYPIXEL?: string
        TWITCH?: string
        DISCORD?: string
      }
    }
  }
}

type UUIDRequestReturn = {id: string, name: string}

class HypixelApiClient {
  apiKey: string
  hypixelApiUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.hypixelApiUrl = `https://api.hypixel.net/`
  }


  // GuildByID(id: string): Guild | null {
  //   return {}
  // }

  // GuildByUUID(uuid: string): Guild | null {
  //   return {}
  // }


  async UserByName(name: string): Promise<User | null> {
    let uuid = await this.UUIDByName(name)
    if(uuid == null) return null

    return await this.UserByUUID(uuid)
  }

  async UserByUUID(uuid: string): Promise<User | null> {
    const response = await fetch(this.hypixelApiUrl+`player?key=${this.apiKey}&uuid=${uuid}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      }
    })

    const result = (await response.json()) as UserResponse

    if(response.status == 400) throw new Error("Bad request! Data is missing")
    else if(response.status == 403) throw new Error("Your api-key is invalid!")
    else if(response.status == 429) throw new Error("Request limit reached!")
    else if(response.status != 200 || result.success == false) {
      console.log(result) 
      throw new Error("Unexpected error happened")
    }

    return {
      uuid: result.player.uuid,
      name: result.player.playername,
      displayName: result.player.displayname,
      firstLogin: new Date(result.player.firstLogin),
      lastLogin: new Date(result.player.lastLogin),
      lastLogout: new Date(result.player.lastLogout),
      rank: result.player.rank,
      karma: result.player.karma
    }

    

  }

  async UUIDByName(name: string): Promise<string|null> {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      }
    })
    if(!response.ok) return null

    const result = (await response.json()) as UUIDRequestReturn;

    return result.id
  }
}

export {HypixelApiClient}