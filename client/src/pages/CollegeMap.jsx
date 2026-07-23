"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

// Standard JS way to check if the browser supports WebGL
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

const CollegeMap = ({ colleges, selectedCollege, onCollegeSelect }) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)

  useEffect(() => {
    // Check for WebGL support using our helper function
    if (!checkWebGLSupport()) {
      setIsWebGLSupported(false)
      return
    }

    if (map.current) return 

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${
        import.meta.env.VITE_MAPTILER_API_KEY || "demo"
      }`,
      center: [-98.5795, 39.8283], 
      zoom: 4,
    })

    map.current.addControl(new maplibregl.NavigationControl(), "top-right")
  }, [])

  useEffect(() => {
    if (!map.current || !colleges.length || !isWebGLSupported) return

    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    colleges.forEach((college, index) => {
      if (college.coordinates) {
        const el = document.createElement("div")
        el.className = "college-marker"
        el.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${selectedCollege?.name === college.name ? "#3b82f6" : "#ef4444"};
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `

        const marker = new maplibregl.Marker(el)
          .setLngLat(college.coordinates)
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold">${college.name}</h3>
                  <p class="text-sm text-gray-600">${college.location}</p>
                  <p class="text-sm">Ranking: #${college.ranking || "N/A"}</p>
                </div>
              `),
          )
          .addTo(map.current)

        el.addEventListener("click", () => {
          onCollegeSelect(college)
        })

        markers.current.push(marker)
      }
    })

    if (colleges.length > 0) {
      const coordinates = colleges.filter((college) => college.coordinates).map((college) => college.coordinates)

      if (coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        coordinates.forEach((coord) => bounds.extend(coord))
        map.current.fitBounds(bounds, { padding: 50 })
      }
    }
  }, [colleges, selectedCollege, onCollegeSelect, isWebGLSupported])

  if (!isWebGLSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        <span className="text-4xl mb-4">🗺️</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map View Unavailable</h3>
        <p className="text-gray-600 max-w-md">
          Your browser doesn't support WebGL, which is required to display the interactive map. 
        </p>
        <p className="text-sm text-gray-500 mt-2">
          You can still browse the college list on the left, or enable Hardware Acceleration in your browser settings to see the map.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {!import.meta.env.VITE_MAPTILER_API_KEY && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2">Map requires MapTiler API key</p>
            <p className="text-sm text-gray-500">Add VITE_MAPTILER_API_KEY to your environment</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollegeMap
































// "use client"

// import { useEffect, useRef } from "react"
// import maplibregl from "maplibre-gl"
// import "maplibre-gl/dist/maplibre-gl.css"

// const CollegeMap = ({ colleges, selectedCollege, onCollegeSelect }) => {
//   const mapContainer = useRef(null)
//   const map = useRef(null)
//   const markers = useRef([])

//   useEffect(() => {
//     if (map.current) return 

//     map.current = new maplibregl.Map({
//       container: mapContainer.current,
//     style: `https://api.maptiler.com/maps/streets/style.json?key=${
//     import.meta.env.VITE_MAPTILER_API_KEY || "demo"
//   }`,
//       center: [-98.5795, 39.8283], 
//       zoom: 4,
//     })

//     map.current.addControl(new maplibregl.NavigationControl(), "top-right")
//   }, [])

//   useEffect(() => {
//     if (!map.current || !colleges.length) return

//     markers.current.forEach((marker) => marker.remove())
//     markers.current = []

//     colleges.forEach((college, index) => {
//       if (college.coordinates) {
//         const el = document.createElement("div")
//         el.className = "college-marker"
//         el.style.cssText = `
//           width: 12px;
//           height: 12px;
//           border-radius: 50%;
//           background-color: ${selectedCollege?.name === college.name ? "#3b82f6" : "#ef4444"};
//           border: 2px solid white;
//           cursor: pointer;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         `

//         const marker = new maplibregl.Marker(el)
//           .setLngLat(college.coordinates)
//           .setPopup(
//             new maplibregl.Popup({ offset: 25 }).setHTML(`
//                 <div class="p-2">
//                   <h3 class="font-semibold">${college.name}</h3>
//                   <p class="text-sm text-gray-600">${college.location}</p>
//                   <p class="text-sm">Ranking: #${college.ranking || "N/A"}</p>
//                 </div>
//               `),
//           )
//           .addTo(map.current)

//         el.addEventListener("click", () => {
//           onCollegeSelect(college)
//         })

//         markers.current.push(marker)
//       }
//     })

//     if (colleges.length > 0) {
//       const coordinates = colleges.filter((college) => college.coordinates).map((college) => college.coordinates)

//       if (coordinates.length > 0) {
//         const bounds = new maplibregl.LngLatBounds()
//         coordinates.forEach((coord) => bounds.extend(coord))
//         map.current.fitBounds(bounds, { padding: 50 })
//       }
//     }
//   }, [colleges, selectedCollege, onCollegeSelect])

//   return (
//     <div className="relative w-full h-full">
//       <div ref={mapContainer} className="w-full h-full rounded-lg" />
//       {!import.meta.env.VITE_MAPTILER_API_KEY && (
//   <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
//     <div className="text-center p-4">
//       <p className="text-gray-600 mb-2">Map requires MapTiler API key</p>
//       <p className="text-sm text-gray-500">Add VITE_MAPTILER_API_KEY to your environment</p>
//     </div>
//   </div>
// )}

//     </div>
//   )
// }

// export default CollegeMap
