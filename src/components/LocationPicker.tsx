import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Navigation, ExternalLink, X, Loader2 } from 'lucide-react'
import MapService, { Location } from '../services/mapService'

interface LocationPickerProps {
  value?: Location | null
  onChange: (location: Location | null) => void
  placeholder?: string
  className?: string
  showMap?: boolean
  mapHeight?: number
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "搜索地点...",
  className = "",
  showMap = true,
  mapHeight = 200
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<Location | null>(null)

  // 初始化地图服务
  useEffect(() => {
    MapService.initialize().catch(console.warn)
  }, [])

  // 搜索地点
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await MapService.searchPlaces(query, userLocation ? {
        lat: userLocation.latitude!,
        lng: userLocation.longitude!
      } : undefined)
      setSearchResults(results)
    } catch (error) {
      console.warn('搜索地点失败:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 防抖搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, userLocation])

  // 获取当前位置
  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    try {
      const location = await MapService.getCurrentLocation()
      if (location) {
        setUserLocation(location)
        onChange(location)
        setSearchQuery(location.address)
        setIsOpen(false)
      }
    } catch (error) {
      console.warn('获取位置失败:', error)
    } finally {
      setIsGettingLocation(false)
    }
  }

  // 选择地点
  const selectLocation = (location: Location) => {
    onChange(location)
    setSearchQuery(location.address)
    setIsOpen(false)
  }

  // 清除选择
  const clearSelection = () => {
    onChange(null)
    setSearchQuery('')
    setSearchResults([])
  }

  // 打开Google Maps
  const openInGoogleMaps = (location: Location) => {
    MapService.openGoogleMaps(location)
  }

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* 获取当前位置按钮 */}
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            title="获取当前位置"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 搜索结果下拉框 */}
        <AnimatePresence>
          {isOpen && (searchQuery || searchResults.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {isSearching && (
                <div className="p-3 text-center text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  搜索中...
                </div>
              )}
              
              {!isSearching && searchResults.length === 0 && searchQuery && (
                <div className="p-3 text-center text-gray-500">
                  未找到相关地点
                </div>
              )}
              
              {searchResults.map((location, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectLocation(location)}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {location.name || location.address}
                      </p>
                      {location.name && (
                        <p className="text-xs text-gray-500 truncate">
                          {location.address}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openInGoogleMaps(location)
                      }}
                      className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-500"
                      title="在Google Maps中打开"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 地图预览 */}
      {showMap && value && value.latitude && value.longitude && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: mapHeight }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 overflow-hidden rounded-lg border border-gray-200"
        >
          <div className="relative">
            <img
              src={MapService.generateStaticMapUrl(value, {
                width: 600,
                height: mapHeight,
                zoom: 15
              })}
              alt="地点预览"
              className="w-full h-full object-cover"
            />
            
            {/* 地图覆盖层 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all cursor-pointer flex items-center justify-center group">
              <button
                onClick={() => openInGoogleMaps(value)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-opacity-100"
              >
                <ExternalLink className="w-4 h-4 inline mr-1" />
                在Google Maps中打开
              </button>
            </div>
          </div>
          
          {/* 地点信息 */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value.name || value.address}
                </p>
                {value.name && (
                  <p className="text-xs text-gray-500 truncate">
                    {value.address}
                  </p>
                )}
                {value.latitude && value.longitude && (
                  <p className="text-xs text-gray-400">
                    {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              
              {/* 导航按钮组 */}
              <div className="flex space-x-1 ml-3">
                <button
                  onClick={() => MapService.openGoogleMaps(value, 'driving')}
                  className="p-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  title="驾车导航"
                >
                  🚗
                </button>
                <button
                  onClick={() => MapService.openGoogleMaps(value, 'walking')}
                  className="p-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                  title="步行导航"
                >
                  🚶
                </button>
                <button
                  onClick={() => MapService.openGoogleMaps(value, 'transit')}
                  className="p-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                  title="公共交通"
                >
                  🚇
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 点击外部关闭下拉框 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default LocationPicker 