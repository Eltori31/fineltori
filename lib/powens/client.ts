import axios, { AxiosInstance } from 'axios'

export class PowernsClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.POWENS_API_URL || 'https://fineltori-sandbox.biapi.pro/2.0',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Create a user and get a permanent token
   * Returns both the auth_token and user_id
   */
  async createUserAndToken() {
    try {
      const response = await this.client.post('/auth/init', {
        client_id: process.env.POWENS_CLIENT_ID,
        client_secret: process.env.POWENS_CLIENT_SECRET,
      })

      return {
        auth_token: response.data.auth_token,
        id_user: response.data.id_user,
        type: response.data.type,
      }
    } catch (error) {
      console.error('Error creating Powens user:', error)
      throw error
    }
  }

  /**
   * Get authorization headers with auth token
   */
  private getHeaders(authToken: string) {
    return {
      Authorization: `Bearer ${authToken}`,
    }
  }

  /**
   * Get the webview URL for connecting banks
   */
  getWebviewUrl(authToken: string, redirectUrl: string) {
    const baseUrl = process.env.POWENS_API_URL?.replace('/2.0', '') || 'https://fineltori-sandbox.biapi.pro'
    return `${baseUrl}/auth/webview/${process.env.POWENS_CLIENT_ID}?token=${authToken}&redirect_uri=${encodeURIComponent(redirectUrl)}`
  }

  /**
   * Get all accounts for a user
   */
  async getAccounts(authToken: string, userId: string) {
    try {
      const headers = this.getHeaders(authToken)
      const response = await this.client.get(
        `/users/${userId}/accounts`,
        { headers }
      )
      return response.data.accounts || []
    } catch (error) {
      console.error('Error fetching accounts:', error)
      throw error
    }
  }

  /**
   * Get transactions for a specific account
   */
  async getTransactions(
    authToken: string,
    userId: string,
    accountId: string,
    params?: {
      min_date?: string
      max_date?: string
      limit?: number
      offset?: number
    }
  ) {
    try {
      const headers = this.getHeaders(authToken)
      const response = await this.client.get(
        `/users/${userId}/accounts/${accountId}/transactions`,
        {
          headers,
          params: {
            limit: params?.limit || 100,
            offset: params?.offset || 0,
            ...(params?.min_date && { min_date: params.min_date }),
            ...(params?.max_date && { max_date: params.max_date }),
          }
        }
      )
      return response.data.transactions || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  /**
   * Trigger a manual synchronization for a user
   */
  async syncUser(authToken: string, userId: string) {
    try {
      const headers = this.getHeaders(authToken)
      const response = await this.client.post(
        `/users/${userId}/connections`,
        {},
        { headers }
      )
      return response.data
    } catch (error) {
      console.error('Error syncing user:', error)
      throw error
    }
  }

  /**
   * Get all connections for a user
   */
  async getConnections(authToken: string, userId: string) {
    try {
      const headers = this.getHeaders(authToken)
      const response = await this.client.get(
        `/users/${userId}/connections`,
        { headers }
      )
      return response.data.connections || []
    } catch (error) {
      console.error('Error fetching connections:', error)
      throw error
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(authToken: string, userId: string) {
    try {
      const headers = this.getHeaders(authToken)
      await this.client.delete(
        `/users/${userId}`,
        { headers }
      )
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
}

// Singleton instance
export const powensClient = new PowernsClient()
