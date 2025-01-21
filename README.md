# Lockin AI
## Links
- [devpost](https://devpost.com/software/lockin-ai)
- [live website](https://lockinai.rohangodha.com/)
- [youtube demo](https://youtu.be/6rx-QIQlB-I?si=dn41a2Kn-HnQPF3K)
- [github](https://github.com/sailalithkanumuri8/LockInAI)
## Inspiration
For most of Gen Z, staying focused on their computer while working is a very difficult problem. With the draw of scrolling on TikTok, or responding to the messages our friends sent, staying focused on your computer screen has become a surprisingly challenging task. 
## What it does
That’s why we made LockIn AI! Our site takes inspiration from Big Brother and continuously watches you through your computer webcam. Then, the feed is transmitted to a pre-trained Tensorflow face detection model from MediaPipe solutions. If we detect that you are looking away from your screen for a certain period of time, you get a notification on your phone reminding you to LOCK IN.
## How it works
Our app has three parts: a website, a realtime backend, and a mobile app.

Let’s start with the backend. This is deployed directly to AWS using SST, an Infrastructure as Code framework. We used AWS’s Websocket API Gateway to give us serverless websockets, connected those to AWS lambda, and used a Turso LibSQL database as our datastore. 

Our website frontend is also deployed directly to AWS using SST. This is a very simple Vite + React app, using Tanstack Router as our router. On our website, we utilize an AI face detector from Mediapipe for face landmark detection. By picking out specific landmarks, we use some basic trigonometry and linear algebra to compute the yaw of the user’s face. Based on this yaw value, we apply a tested yaw threshold in order to detect if the user looks off the screen, for example at their phone. The website also displays a code that allows us to quickly and anonymously connect our website and mobile app together in realtime, without worrying about bluetooth or other local data. 
	
Finally, our mobile app is quite simple. We enter the code displayed on the website to connect to the backend through a websocket, just like the website does. Whenever the website detects the user looking away from their computer webcam for more than 10 seconds, it sends a message to the backend, which forwards it to the mobile app in less than 100 milliseconds. When the phone receives this websocket message, it sends the user a notification to get off their phone. Focusing back on the screen will cause the notifications to stop sounding. However, continuing to look away will sound the notification every 10 seconds, forcing you to get it together and LOCK BACK IN.

## Challenges we ran into
Online hackathons are very different from in person ones, and finding times where everyone was available was very difficult. Shreyas also got sick during the hackathon, and was unable to be a part of our video submission. Despite this, he still had a large impact on the ideation and development of this project.
## Accomplishments that we're proud of
This was 3 of our team members' first hackathon, and one of our member’s third hackathon. We’re very proud of the progress we made despite our low experience. Also, our backend is very cool because of how fast it works, and because it's completely realtime without needing a constantly running server to be deployed somewhere in the cloud. We also chose a pretty ambitious project, especially with how many different languages, runtimes, and UIs we had to build and design in such a short time.
## What we learned
We learned a lot from this project, especially with the huge reach of our project. Everyone worked on every part of this project, and we all got lots of exposure to new technology!
