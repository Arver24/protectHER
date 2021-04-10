import { withGoogleMap, GoogleMap, withScriptjs } from "react-google-maps"
import { useRef, useEffect, useState } from "react"

function MapApp(props) {
	const [cordinates , setCordinates] = useState(props);
	// console.log("Latitude is :", this.state.userlat);
	// console.log("Longitude is :", this.state.userlng);
	useEffect(() => {
		setCordinates(props);
	}, [props])
	
	const GoogleMapExample = withScriptjs(
		withGoogleMap((props) => (
			<GoogleMap
				id='map'
				defaultCenter={{ lat: this.state.userlat, lng: this.state.userlng }}
				defaultZoom={13}></GoogleMap>
		))
	)
	return (
		<div>
			<GoogleMapExample
				containerElement={<div style={{ height: `500px`, width: "500px" }} />}
				mapElement={<div style={{ height: `100%` }} />}
				googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places`}
				loadingElement={<div style={{ height: `100%` }} />}
			/>
		</div>
	)
}
export default MapApp
