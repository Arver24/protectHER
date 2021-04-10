import React from "react"
import "./App.css"
import MicRecorder from "mic-recorder-to-mp3"
import {
	withGoogleMap,
	GoogleMap,
	withScriptjs,
	Marker,
} from "react-google-maps"
import mapStyles from "./mapStyles.js"
import uuid from "react-uuid"
import "firebase/storage"
import publicIp from "public-ip"
import firebase from "firebase/app"
import "firebase/firestore"
import VideoRecorder from "react-video-recorder"
import Logo from "./imgs/protectHER_logo.png"
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
let Ip
const getClientIp = async () =>
	await publicIp
		.v4({
			fallbackUrls: ["https://ifconfig.co/ip"],
		})
		.then((result) => (Ip = result))
getClientIp()
const Mp3Recorder = new MicRecorder({ bitRate: 128 })
let coords = {}

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isRecording: false,
			blobURL: "",
			isBlocked: false,
			islocationBlocked: false,
			userlat: 0,
			userlng: 0,
		}
	}

	start = () => {
		if (this.state.isBlocked) {
			console.log("Audio Recording Permission Denied")
		} else {
			Mp3Recorder.start()
				.then(() => {
					this.setState({ isRecording: true })
				})
				.catch((e) => console.error(e))
		}
	}

	stop = () => {
		Mp3Recorder.stop()
			.getMp3()
			.then(([buffer, blob]) => {
				const blobURL = URL.createObjectURL(blob)
				let date = new Date()
				const storageref = firebase
					.storage()
					.ref(Ip + "/sos_audio_clip" + date.getTime())
				console.log(blobURL)
				storageref.put(blob)
				this.setState({ blobURL, isRecording: false })
			})
			.catch((e) => console.log(e))
	}

	componentDidMount() {
		function showError(error) {
			switch (error.code) {
				case error.PERMISSION_DENIED:
					console.log("User denied the request for Geolocation.")
					break
				case error.POSITION_UNAVAILABLE:
					console.log("Location information is unavailable.")
					break
				case error.TIMEOUT:
					console.log("The request to get user location timed out.")
					break
				default:
					console.log("An unknown error occurred.")
					break
			}
		}
		navigator.mediaDevices.getUserMedia(
			{ audio: true },
			() => {
				console.log("Audio Recording Permission Granted")
				this.setState({ isBlocked: false })
			},
			() => {
				console.log("Audio Recording Permission Denied")
				this.setState({ isBlocked: true })
			}
		)
		if (navigator.geolocation) {
			console.log("Location Permission Granted")
			this.setState({ islocationBlocked: false })
			let prevposition = [0, 0]
			navigator.geolocation.watchPosition((position) => {
				// console.log(prevposition,position);
				if (Ip) {
					this.setState({
						userlat: position.coords.latitude,
						userlng: position.coords.longitude,
					})
					if (
						position.coords.latitude !== prevposition[0] ||
						position.coords.longitude !== prevposition[1]
					) {
						let date = new Date()
						coords[date.getTime()] = {
							lat: this.state.userlat,
							lng: this.state.userlng,
						}
						if (this.state.isRecording) {
							console.log("Uploading")
							firebase
								.firestore()
								.collection("Locations")
								.doc(Ip)
								.set(coords)
								.then((result) => {
									console.log("done")
								})
							prevposition = [
								position.coords.latitude,
								position.coords.longitude,
							]
						}
					}
				}
			}, showError)
		} else {
			console.log("Location Not Available in Browser")
			this.setState({ islocationBlocked: true })
		}
	}

	render() {
		const GoogleMapExample = withScriptjs(
			withGoogleMap((props) => (
				<GoogleMap
					defaultCenter={{ lat: this.state.userlat, lng: this.state.userlng }}
					defaultZoom={13}
					defaultOptions={{ styles: mapStyles }}>
					<Marker
						key={uuid()}
						title='Live Location'
						position={{
							lat: this.state.userlat,
							lng: this.state.userlng,
						}}></Marker>
				</GoogleMap>
			))
		)
		return (
			<div className='App' id='home'>
				<navbar className='navbar' data-aos='fade-down' data-aos-delay='100'>
					<a href='#home'>
						<img src={Logo} alt='' className='protectHer-logo' />
					</a>
					<div
						className='nav-buttons'
						data-aos='fade-down'
						data-aos-delay='100'>
						<a href='#about'>About</a>
						<a href='#awareness'>Awareness</a>
						<a href='tel:100' style={{ color: "red" }}>
							Call Police
						</a>
					</div>
				</navbar>
				<header className='App-header'>
					<div className='buttonAudio' data-aos='zoom' data-aos-delay='200'>
						<button
							className='recordButton'
							onClick={this.start}
							hidden={this.state.isRecording}>
							SOS
						</button>
						<button
							onClick={this.stop}
							hidden={!this.state.isRecording}
							className='recordStopButton'>
							Stop
						</button>
						<audio
							src={this.state.blobURL}
							controls='controls'
							className='audioBar'
						/>
					</div>
					<div className='gmap'>
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
							googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_KEY}`}
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
					<div className='videoContainer'>
						<VideoRecorder
							onRecordingComplete={(videoBlob) => {
								// Do something with the video...
								let date = new Date()
								const storageref = firebase
									.storage()
									.ref(Ip + "/sos_video_clip" + date.getTime())
								storageref.put(videoBlob)
							}}
						/>
					</div>
				</header>
				<div className='awareness' id='awareness'>
					<span className='title'>Awareness</span>
					<div data-aos='fade-right' data-aos-delay='600'>
						It’s a good habit to update your loved ones with the number of
						public transport you are travelling with.
					</div>
					<div data-aos='fade-left' data-aos-delay='600'>
						Do not hesitate to speak about any wrong being done to you even if
						you are being blackmailed. Always inform the police without any
						fear.
					</div>
					<div data-aos='fade-right' data-aos-delay='600'>
						When you are walking on the road, keep your mobile phone handy but
						avoid using it to avoid any distractions. It will also keep you safe
						from some road accidents that might happen.
					</div>
					<div data-aos='fade-left' data-aos-delay='600'>
						{" "}
						For Women Helpline Domestic Abuse Dial{" "}
						<a href='tel:181' style={{ color: "red" }}>
							<b>
								<u>181</u>
							</b>
						</a>
						.
					</div>
					<div data-aos='fade-right' data-aos-delay='600'>
						For Women Helpline (All India) - Women In Distress Dial{" "}
						<a href='tel:1091' style={{ color: "red" }}>
							<b>
								<u>1091</u>
							</b>
						</a>
						.
					</div>
					<div data-aos='fade-left' data-aos-delay='600'>
						We must have all the important Emergency numbers memorized. For
						police Dial{" "}
						<a href='tel:100' style={{ color: "red" }}>
							<b>
								<u>100</u>
							</b>
						</a>
						.
					</div>
					<div data-aos='fade-right' data-aos-delay='600'>
						Sharing your live location with your loved ones when feeling
						insecure while travelling is a good idea.
					</div>
					<div data-aos='fade-left' data-aos-delay='600'>
						Avoid posting real-time social media updates about very personal
						topics.
					</div>
					<div data-aos='fade-right' data-aos-delay='600'>
						Be attentive towards sharing your personal data to websites and
						services.
					</div>
					<div data-aos='fade-left' data-aos-delay='600'>
						Do not drink the drink that you left unattended. Chances are that it
						may have been spiked by someone.
					</div>
					<div data-aos='fade-right' data-aos-delay='600'>
						If you feel someone is stalking you on the road, try to find a
						crowed place and call someone for help. You may go to a nearby house
						and ask for help as well.
					</div>
					<div data-aos='fade-left' data-aos-delay='600'>
						Learning self-defence techniques will give you the confidence you
						need.
					</div>
					<div data-aos='fade-right' data-aos-delay='600'>
						Carrying a pepper spray might come in handy while self-defending.
					</div>
					<div data-aos='fade-left' data-aos-delay='600'>
						Be aware of your surroundings and pay attention to what’s happening
						and keep yourself updated. It might help you analyze situations, and
						you can react fast. Don’t let your guard down.
					</div>
					<div data-aos='fade-right' data-aos-delay='600'>
						If you get a chance, don’t hesitate to throw a hard punch on anyone
						asking for it.
					</div>
				</div>
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
}

export default App
