// 地图服务 - 集成Google Maps和定位功能
export interface Location {
  address: string
  latitude?: number
  longitude?: number
  placeId?: string
  name?: string
  types?: string[]
}

export interface MapConfig {
  apiKey: string
  defaultZoom: number
  defaultCenter: { lat: number; lng: number }
}

class MapService {
  private googleMaps: any = null
  private isLoaded = false
  private loadPromise: Promise<void> | null = null

  // 初始化Google Maps API
  async initialize(apiKey?: string): Promise<void> {
    if (this.isLoaded) return
    if (this.loadPromise) return this.loadPromise

    this.loadPromise = new Promise((resolve, reject) => {
      try {
        // 检查是否已经加载了Google Maps
        if (window.google && window.google.maps) {
          this.googleMaps = window.google.maps
          this.isLoaded = true
          resolve()
          return
        }

        // 动态加载Google Maps API
        const script = document.createElement('script')
        const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo_key'
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initMap`
        script.async = true
        script.defer = true

        // 全局回调函数
        window.initMap = () => {
          this.googleMaps = window.google.maps
          this.isLoaded = true
          resolve()
        }

        script.onerror = () => {
          console.warn('Google Maps API加载失败，使用模拟模式')
          this.initMockMode()
          resolve()
        }

        document.head.appendChild(script)
      } catch (error) {
        console.warn('Google Maps初始化失败，使用模拟模式:', error)
        this.initMockMode()
        resolve()
      }
    })

    return this.loadPromise
  }

  // 模拟模式（当Google Maps API不可用时）
  private initMockMode(): void {
    this.isLoaded = true
    this.googleMaps = {
      // 模拟Google Maps对象
      mockMode: true
    }
  }

  // 获取用户当前位置
  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('浏览器不支持地理定位')
        resolve(this.getDefaultLocation())
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            // 反向地理编码获取地址
            const address = await this.reverseGeocode(latitude, longitude)
            resolve({
              address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              latitude,
              longitude
            })
          } catch (error) {
            console.warn('反向地理编码失败:', error)
            resolve({
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              latitude,
              longitude
            })
          }
        },
        (error) => {
          console.warn('获取位置失败:', error)
          resolve(this.getDefaultLocation())
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5分钟缓存
        }
      )
    })
  }

  // 默认位置（北京）
  private getDefaultLocation(): Location {
    return {
      address: '北京市',
      latitude: 39.9042,
      longitude: 116.4074,
      name: '北京市'
    }
  }

  // 地点搜索
  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<Location[]> {
    if (!this.isLoaded) {
      await this.initialize()
    }

    // 模拟模式返回示例数据
    if (this.googleMaps?.mockMode) {
      return this.getMockSearchResults(query)
    }

    try {
      if (!this.googleMaps?.places) {
        throw new Error('Google Places API未加载')
      }

      return new Promise((resolve) => {
        const service = new this.googleMaps.places.PlacesService(document.createElement('div'))
        
        const request = {
          query,
          location: location ? new this.googleMaps.LatLng(location.lat, location.lng) : undefined,
          radius: location ? 50000 : undefined, // 50km radius
        }

        service.textSearch(request, (results: any[], status: any) => {
          if (status === this.googleMaps.places.PlacesServiceStatus.OK && results) {
            const locations = results.slice(0, 5).map((place: any) => ({
              address: place.formatted_address || place.name,
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng(),
              placeId: place.place_id,
              name: place.name,
              types: place.types
            }))
            resolve(locations)
          } else {
            resolve(this.getMockSearchResults(query))
          }
        })
      })
    } catch (error) {
      console.warn('地点搜索失败，返回模拟结果:', error)
      return this.getMockSearchResults(query)
    }
  }

  // 模拟搜索结果
  private getMockSearchResults(query: string): Location[] {
    const mockResults = [
      { name: '北京大学', address: '北京市海淀区颐和园路5号', latitude: 39.9990, longitude: 116.3059 },
      { name: '清华大学', address: '北京市海淀区清华园1号', latitude: 40.0044, longitude: 116.3164 },
      { name: '天安门广场', address: '北京市东城区天安门广场', latitude: 39.9043, longitude: 116.3977 },
      { name: '故宫博物院', address: '北京市东城区景山前街4号', latitude: 39.9163, longitude: 116.3971 },
      { name: '鸟巢', address: '北京市朝阳区国家体育场南路1号', latitude: 39.9928, longitude: 116.3971 }
    ]

    return mockResults
      .filter(place => place.name.includes(query) || place.address.includes(query))
      .slice(0, 3)
  }

  // 反向地理编码
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (!this.isLoaded) {
      await this.initialize()
    }

    if (this.googleMaps?.mockMode) {
      return `模拟地址 ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }

    try {
      if (!this.googleMaps?.Geocoder) {
        throw new Error('Google Geocoder未加载')
      }

      return new Promise((resolve) => {
        const geocoder = new this.googleMaps.Geocoder()
        const latlng = new this.googleMaps.LatLng(lat, lng)

        geocoder.geocode({ location: latlng }, (results: any[], status: any) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address)
          } else {
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.warn('反向地理编码失败:', error)
      return null
    }
  }

  // 生成地图静态图片URL
  generateStaticMapUrl(location: Location, options: {
    width?: number
    height?: number
    zoom?: number
    mapType?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid'
    markers?: boolean
  } = {}): string {
    const {
      width = 300,
      height = 200,
      zoom = 15,
      mapType = 'roadmap',
      markers = true
    } = options

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey || apiKey === 'demo_key') {
      // 返回占位图片
      return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=地图预览`
    }

    const { latitude, longitude, address } = location
    let center = ''
    let markerParam = ''

    if (latitude && longitude) {
      center = `${latitude},${longitude}`
      if (markers) {
        markerParam = `&markers=color:red%7C${latitude},${longitude}`
      }
    } else if (address) {
      center = encodeURIComponent(address)
      if (markers) {
        markerParam = `&markers=color:red%7C${encodeURIComponent(address)}`
      }
    }

    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${width}x${height}&maptype=${mapType}${markerParam}&key=${apiKey}`
  }

  // 打开Google Maps导航
  openGoogleMaps(location: Location, mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'): void {
    let url = 'https://www.google.com/maps/'
    
    if (location.latitude && location.longitude) {
      url += `@${location.latitude},${location.longitude},15z`
    } else if (location.address) {
      url += `search/${encodeURIComponent(location.address)}`
    }

    // 添加导航模式
    if (location.latitude && location.longitude) {
      url += `/data=!3m1!4b1!4m2!4m1!3e${this.getModeCode(mode)}`
    }

    window.open(url, '_blank')
  }

  // 获取导航模式代码
  private getModeCode(mode: string): string {
    switch (mode) {
      case 'driving': return '0'
      case 'walking': return '2'
      case 'transit': return '3'
      case 'bicycling': return '1'
      default: return '0'
    }
  }

  // 计算两点间距离（简单计算）
  calculateDistance(loc1: Location, loc2: Location): number | null {
    if (!loc1.latitude || !loc1.longitude || !loc2.latitude || !loc2.longitude) {
      return null
    }

    const R = 6371 // 地球半径（公里）
    const dLat = this.deg2rad(loc2.latitude - loc1.latitude)
    const dLon = this.deg2rad(loc2.longitude - loc1.longitude)
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(loc1.latitude)) * Math.cos(this.deg2rad(loc2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // 距离（公里）
    
    return Math.round(distance * 100) / 100 // 保留两位小数
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  // 获取地点详情
  async getPlaceDetails(placeId: string): Promise<Location | null> {
    if (!this.isLoaded) {
      await this.initialize()
    }

    if (this.googleMaps?.mockMode) {
      return {
        address: '模拟地点详情',
        placeId,
        name: '模拟地点'
      }
    }

    try {
      if (!this.googleMaps?.places) {
        throw new Error('Google Places API未加载')
      }

      return new Promise((resolve) => {
        const service = new this.googleMaps.places.PlacesService(document.createElement('div'))
        
        service.getDetails({
          placeId,
          fields: ['name', 'formatted_address', 'geometry', 'place_id', 'types']
        }, (place: any, status: any) => {
          if (status === this.googleMaps.places.PlacesServiceStatus.OK && place) {
            resolve({
              address: place.formatted_address || place.name,
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng(),
              placeId: place.place_id,
              name: place.name,
              types: place.types
            })
          } else {
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.warn('获取地点详情失败:', error)
      return null
    }
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this.isLoaded
  }
}

// 全局声明
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default new MapService() 