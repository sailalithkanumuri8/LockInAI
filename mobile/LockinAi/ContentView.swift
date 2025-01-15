//
//  ContentView.swift
//  LockinAi
//
//  Created by Rohan Godha on 1/12/25.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var websocketManager = WebSocketManager()
    @State private var messageText = ""
    @State private var showingPermissionAlert = false
    
    var body: some View {
        ZStack {
            Color("Color")
                .opacity(0.8)
                .edgesIgnoringSafeArea(.all)
            
            Image("Background")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 500, height: 870)
                .edgesIgnoringSafeArea(.all)
            
            VStack {
                Image("Logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 350, height: 350)
                    .clipShape(Circle())
                    .shadow(radius: 5)
                
                Text("LockIn")
                    .fontWeight(.black)
                    .foregroundColor(.white)
                    .font(Font.custom("Sans Sherrif", size: 50))
                    .bold()
                    .multilineTextAlignment(.center)
                
                if !websocketManager.isConnected {
                    HStack {
                        TextField("Enter code", text: $messageText)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .padding(.horizontal)
                            .frame(width: 150, height: 100)
                            .cornerRadius(100)
                        
                        Button(action: sendMessage) {
                            Text("Send")
                                .frame(width: 60, height: 60)
                                .background(.blue)
                                .foregroundColor(.white)
                                .cornerRadius(60)
                        }
                    }
                    .padding()
                } else {
                    Button(action: disconnect) {
                        Text("Disconnect")
                            .frame(width: 120, height: 60)
                            .background(.red)
                            .foregroundColor(.white)
                            .cornerRadius(30)
                    }
                    .padding()
                }
            }
            .onAppear {
                // Request notification permissions when view appears
                UNUserNotificationCenter.current().getNotificationSettings { settings in
                    if settings.authorizationStatus == .notDetermined {
                        DispatchQueue.main.async {
                            showingPermissionAlert = true
                        }
                    }
                }
                // Connect to your WebSocket server
                websocketManager.connect(to: "wss://ws.lockinai.rohangodha.com")
            }
            .sheet(isPresented: $showingPermissionAlert) {
                NotificationPermissionView()
            }
            .onDisappear {
                websocketManager.disconnect()
            }
        }
    }
    
    private func sendMessage() {
        guard !messageText.isEmpty else { return }
        websocketManager.send(messageText)
        messageText = ""
    }
    
    private func disconnect() {
        websocketManager.disconnect()
    }
}

struct NotificationPermissionView: View {
    @Environment(\.dismiss) var dismiss // To allow dismissing the sheet
    @State private var permissionStatus: String = ""

    var body: some View {
        VStack {
            Text("This app needs notification permissions to alert you when you look away.")
                .multilineTextAlignment(.center)
                .padding()
            
            Text(permissionStatus)
                .font(.caption)
                .foregroundColor(.gray)
                .padding(.top)

            Button("Enable Notifications") {
                UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
                    DispatchQueue.main.async {
                        if granted {
                            permissionStatus = "Notifications enabled."
                            dismiss() // Dismiss the sheet
                        } else if let error = error {
                            permissionStatus = "Error: \(error.localizedDescription)"
                        } else {
                            permissionStatus = "Notifications denied."
                        }
                    }
                }
            }
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)

            Button("Cancel") {
                dismiss() // Dismiss the sheet if the user cancels
            }
            .padding(.top)
        }
        .padding()
    }
}


#Preview {
    ContentView()
}
