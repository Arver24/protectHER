import React, { useState } from "react"
import "./App.css"
import {
	withGoogleMap,
	GoogleMap,
	withScriptjs,
	Marker,
} from "react-google-maps"
import mapStyles from "./mapStyles.js"
import uuid from "react-uuid"
import "firebase/storage"
import firebase from "firebase/app"
import "firebase/firestore"
import Logo from "./imgs/sos_logo.png"
import "aos/dist/aos.css"

const config = {
	apikey: process.env.REACT_APP_FIREBASE_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_DATABASE_URL,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	projectId: process.env.REACT_APP_PROJECT_ID,
	appId: process.env.REACT_APP_APP_ID,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
}
firebase.initializeApp(config)

function App() {
	const [ipAddress, setIPAddress] = useState("")
	const [blobURL, setblobURL] = useState("")
	const [videoBlobURL, setVideoBlobURL] = useState("")
	const [origin, setOrigin] = useState({ lat: 0, lng: 0 })
	const [destination, setDestination] = useState({ lat: 0, lng: 0 })
	const [others, setOthers] = useState([])
	const [ipsdiv, setIpsdiv] = useState([])
	let GoogleMapExample = withScriptjs(
		withGoogleMap((props) => {
			let Markers = others.map((obj) => (
				<Marker
					key={uuid()}
					title='Live Location'
					position={{
						lat: obj.lat,
						lng: obj.lng,
					}}></Marker>
			))
			return (
				<GoogleMap
					defaultCenter={{ lat: origin.lat, lng: origin.lng }}
					defaultZoom={13}
					defaultOptions={{ styles: mapStyles }}>
					<Marker
						key={uuid()}
						title='Live Location'
						position={{
							lat: origin.lat,
							lng: origin.lng,
						}}></Marker>
					{Markers}
					<Marker
						key={uuid()}
						title='Live Location'
						position={{
							lat: destination.lat,
							lng: destination.lng,
						}}></Marker>
				</GoogleMap>
			)
		})
	)
	function getIps() {
		firebase
			.firestore()
			.collection("Locations")
			.get()
			.then((querySnapshot) => {
				let data = Object.values(querySnapshot.docs.map((doc) => doc.id))
				setIpsdiv(
					data.map((ip) => {
						return <span>{ip}, </span>
					})
				)
			})
	}
	function getData() {
		firebase
			.storage()
			.ref(ipAddress)
			.listAll()
			.then(function (result) {
				result.items.forEach(function (fileRef) {
					console.log(fileRef.name)
					fileRef.getDownloadURL().then(function (fileURL) {
						if (fileRef.name.includes("audio")) {
							// console.log(fileURL);
							setblobURL(fileURL)
						} else if (fileRef.name.includes("video")) {
							setVideoBlobURL(fileURL)
						}
					})
				})
			})
		firebase
			.firestore()
			.collection("Locations")
			.doc(ipAddress)
			.get()
			.then((queryMap) => {
				let data = queryMap.data()
				var ind = 0
				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						if (ind === 0) setOrigin(data[key])
						else if (ind === Object.keys(data).length - 1)
							setDestination(data[key])
						else {
							let otherTemp = others
							otherTemp.push(data[key])
							setOthers(otherTemp)
						}
						ind++
					}
				}
			})
			.catch((err) => console.log(err))
	}
	return (
		<div className='App' id='home'>
			<navbar className='navbar' data-aos='fade-down' data-aos-delay='100'>
				<a href='#home'>
					<img src={Logo} alt='' className='sos-logo' />
				</a>
				<div className='nav-buttons' data-aos='fade-down' data-aos-delay='100'>
					<a href='#about'>About</a>
				</div>
			</navbar>
			<header className='App-header'>
				<div className='buttonAudio'>
					<div className='addresses'>{ipsdiv}</div>
					<button onClick={getIps} className='getipButton'>
						Get IP Addresses
					</button>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							getData()
						}}>
						<input
							type='text'
							placeholder='Enter the IP address : '
							onChange={(e) => setIPAddress(e.target.value)}
							value={ipAddress}
							className='inputIP'
							name='ip'
							reqired
						/>
						<button type='submit' value='submit' className='submit'>
							Submit
						</button>
					</form>
					<audio src={blobURL} controls='controls' className='audioBar' />
				</div>
				<div>
					<GoogleMapExample
						containerElement={
							<div
								style={{
									height: `500px`,
									width: "500px",
									borderRadius: "15px",
									boxShadow: "5px 5px 5px #3b3b3b, -5px -5px 5px #d8d8d8",
								}}
							/>
						}
						mapElement={
							<div
								style={{
									height: `500px`,
									width: "500px",
									borderRadius: "15px",
								}}
							/>
						}
						googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${
						  process.env.REACT_APP_GOOGLE_KEY
							}`}
						// googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places}`}
						loadingElement={
							<div
								style={{
									height: `500px`,
									width: "500px",
									borderRadius: "15px",
								}}
							/>
						}></GoogleMapExample>
				</div>
				<div>
					<video
						src={videoBlobURL}
						controls='controls'
						className='videoContaner'
						hidden={!videoBlobURL}
					/>
				</div>
			</header>
			<footer id='about'>
				<hr />
				{/* <div id='copyright'>&copy; All Rights Reserved</div> */}
				<div id='owner'>
					<span>
						Developed by
						<a href='https://www.linkedin.com/in/archit-verma-609022204/'>
							Archit
						</a>
						, <a href='https://www.linkedin.com/in/mehul-kaushal-86547319a/'>Mehul</a>,{" "}
						<a href='https://www.linkedin.com/in/sanskaromar-'>Sanskar</a> and{" "}
						<a href='https://www.linkedin.com/in/priyavkaneria'>Priyav</a>
					</span>
				</div>
			</footer>
		</div>
	)
}

export default App
