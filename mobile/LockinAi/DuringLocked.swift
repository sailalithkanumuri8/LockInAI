//
//  DuringLocked.swift
//  LockinAi
//
//  Created by Rohan Godha on 1/12/25.
//

import SwiftUI

struct DuringLocked: View {
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
                Text("Continue LOCKING IN!")
                    .fontWeight(.black)
                    .foregroundColor(.white)
                    .font(Font.custom("Sans Sherrif", size: 80))
                    .bold()
                    .multilineTextAlignment(.center)
            }
        }
    }
}

#Preview {
    ContentView()
}


