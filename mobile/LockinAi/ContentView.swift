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
            }
            .onAppear {
                // Replace with your WebSocket server URL
                websocketManager.connect(to: "wss://yzzswl0nke.execute-api.us-east-1.amazonaws.com/$default")
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
}

#Preview {
    ContentView()
}

